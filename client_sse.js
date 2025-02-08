import { EventSource } from 'eventsource'

const senha = '123456'

const response = await fetch('http://127.0.0.1:3333/__transmit/subscribe', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ uid: senha, channel: 'notification/ola' }), // Substitua pelo UID do usuário
})

if (!response.ok) {
  console.error('Erro ao conectar com o servidor SSE:', response.statusText)
}

const url = `http://127.0.0.1:3333/__transmit/events?uid=${senha}` // Substitua pela URL do servidor SSE
const eventSource = new EventSource(url)

// Evento padrão de mensagem
eventSource.onmessage = (event) => {
  console.log('Mensagem recebida:', event.data)
}

eventSource.addEventListener('message', (event) => {
  console.log('Mensagem recebida:', event.data)
})

// Evento de erro
eventSource.onerror = (error) => {
  console.error('Erro na conexão SSE:', error)
}

// Evento customizado
eventSource.addEventListener('customEvent', (event) => {
  console.log('Evento customizado recebido:', event.data)
})
