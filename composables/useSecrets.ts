export default function useSecret() {
    const config = useRuntimeConfig();
    const secretKey = config.public.secretKey;

    function generateRandomSlice(length: number): string {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let randomString = '';
        for (let i = 0; i < length; i++) {
            randomString += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return randomString;
    }
    
    function encode(str: string, key: string = secretKey, sliceLength: number = 8): string {
        const encoder = new TextEncoder();
        const textBytes = encoder.encode(str);
        const keyBytes = encoder.encode(key);
        
        const encodedBytes = textBytes.map((byte, index) => byte ^ keyBytes[index % keyBytes.length]);
      
        const encoderOutput = new TextDecoder();
        let encodedString = btoa(String.fromCharCode(...encodedBytes));
      
        const randomStart = generateRandomSlice(sliceLength);
        const randomEnd = generateRandomSlice(sliceLength);
        
        return randomStart + encodedString + randomEnd;
    }
      
    function decode(encodedStr: string, key: string = secretKey, sliceLength: number = 8): string {
        const slicedStr = encodedStr.slice(sliceLength, -sliceLength);
      
        const decoder = new TextDecoder();
        const decodedBytes = Uint8Array.from(atob(slicedStr), (c) => c.charCodeAt(0));
        const keyBytes = new TextEncoder().encode(key);
        
        const decodedTextBytes = decodedBytes.map((byte, index) => byte ^ keyBytes[index % keyBytes.length]);
      
        return decoder.decode(decodedTextBytes);
    }

    function jsonify<T>(data: string) {
        try {
            return <T> JSON.parse(data);
        } catch (e){
            return null;
        }
    }

    return {
        encode,
        decode,
        jsonify,
    };
}