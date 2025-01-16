function isValidCPF(value: string) {
    // Se não for string, o CPF é inválido
    if (typeof value !== 'string') {
        return false;
    }

    // Remove todos os caracteres que não sejam números
    value = value.replace(/[^\d]+/g, '');

    // Se o CPF não tem 11 dígitos ou todos os dígitos são repetidos, o CPF é inválido
    if (value.length !== 11 || !!value.match(/(\d)\1{10}/)) {
        return false;
    }
    
    // Transforma de string para number[] com cada dígito sendo um número no array
    const digits = value.split('').map(el => +el);

    // Função que calcula o dígito verificador de acordo com a fórmula da Receita Federal
    function getVerifyingDigit(arr: number[]) {
        const reduced = arr.reduce( (sum, digit, index)=>(sum + digit * (arr.length - index + 1)), 0 );
        return (reduced * 10) % 11 % 10;
    }

    // O CPF é válido se, e somente se, os dígitos verificadores estão corretos
    return getVerifyingDigit(digits.slice(0, 9)) === digits[9]
        && getVerifyingDigit(digits.slice(0, 10)) === digits[10];
}