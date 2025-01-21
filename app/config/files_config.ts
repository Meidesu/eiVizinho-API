export type MediaFileType = "image" | "video" | "audio"

export abstract class ValidFileExtensions {
    static audioNames = ["mp3"]
    static videoNames = ["mp4", "mkv"]
    static imageNames = ["png", "jpg", "jpeg"]
    static names = [...this.imageNames, ...this.videoNames, ...this.audioNames]

    static getFileType(extname: string): MediaFileType | null{
        if(this.audioNames.includes(extname)) return "audio";
        if(this.imageNames.includes(extname)) return "image"
        if(this.videoNames.includes(extname)) return "video"
        return null;
    }
}
