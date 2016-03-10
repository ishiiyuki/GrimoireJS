import ResourceWrapper from "../ResourceWrapper";
class TextureWrapperBase extends ResourceWrapper {
    constructor(owner, parent) {
        super(owner);
        this._targetTexture = null;
        this._parent = parent;
        this._parent.onFilterParameterChanged(this._applyTextureParameter.bind(this));
    }
    get Parent() {
        return this._parent;
    }
    get TargetTexture() {
        return this._targetTexture;
    }
    bind() {
        if (this._targetTexture != null) {
            this.GL.bindTexture(this.Parent.TargetTextureType, this._targetTexture);
        }
        else {
            this.GL.bindTexture(this.Parent.TargetTextureType, null);
        }
    }
    registerTexture(registerIndex) {
        if (this.TargetTexture == null) {
            this.GL.activeTexture(WebGLRenderingContext.TEXTURE0 + registerIndex);
            this.GL.bindTexture(this._parent.TargetTextureType, null);
            return false;
        }
        this.GL.activeTexture(WebGLRenderingContext.TEXTURE0 + registerIndex);
        this._applyTextureParameter();
        return true;
    }
    init() {
        return;
    }
    preTextureUpload() {
        if (this._parent.FlipY) {
            this.GL.pixelStorei(WebGLRenderingContext.UNPACK_FLIP_Y_WEBGL, 1);
        }
        else {
            this.GL.pixelStorei(WebGLRenderingContext.UNPACK_FLIP_Y_WEBGL, 0);
        }
    }
    generateHtmlImage(encoder) {
        return null;
    }
    dispose() {
        if (this._targetTexture) {
            this.GL.deleteTexture(this._targetTexture);
            this.__setInitialized(false);
            this._targetTexture = null;
        }
    }
    getPixel(x, y) {
        const result = new Uint8Array(4);
        const frameBuffer = this.GL.createFramebuffer();
        this.GL.bindFramebuffer(this.GL.FRAMEBUFFER, frameBuffer);
        this.GL.framebufferTexture2D(this.GL.FRAMEBUFFER, this.GL.COLOR_ATTACHMENT0, this.GL.TEXTURE_2D, this._targetTexture, 0);
        this.GL.readPixels(x, y, 1, 1, this.GL.RGBA, this.Parent.ElementFormat, result);
        this.GL.deleteFramebuffer(frameBuffer);
        return result;
    }
    __setTargetTexture(texture) {
        this._targetTexture = texture;
    }
    __encodeHtmlImage(width, height, encode) {
        const lastFBO = this.GL.getParameter(this.GL.FRAMEBUFFER_BINDING);
        // Create framebuffer to transfer texture data
        const framebuffer = this.GL.createFramebuffer();
        this.GL.bindFramebuffer(this.GL.FRAMEBUFFER, framebuffer);
        this.GL.framebufferTexture2D(this.GL.FRAMEBUFFER, this.GL.COLOR_ATTACHMENT0, this.GL.TEXTURE_2D, this._targetTexture, 0);
        let data;
        let dataArrayConstructor;
        let transformFunc;
        switch (this.Parent.ElementFormat) {
            case WebGLRenderingContext.FLOAT:
                dataArrayConstructor = Float32Array;
                break;
            case WebGLRenderingContext.UNSIGNED_BYTE:
                dataArrayConstructor = Uint8Array;
                break;
            case WebGLRenderingContext.UNSIGNED_SHORT:
            case WebGLRenderingContext.UNSIGNED_SHORT_5_6_5:
            case WebGLRenderingContext.UNSIGNED_SHORT_4_4_4_4:
            case WebGLRenderingContext.UNSIGNED_SHORT_5_5_5_1:
                dataArrayConstructor = Uint16Array;
                break;
            default:
                console.error("Element format is not supported!");
                return;
        }
        switch (this.Parent.TextureFormat) {
            case WebGLRenderingContext.RGB:
                data = new dataArrayConstructor(width * height * 4);
                transformFunc = (w, h, arr) => {
                    const ret = new Uint8Array(w * h * 4);
                    for (let x = 0; x < w; x++) {
                        for (let y = 0; y < h; y++) {
                            ret[4 * (y * w + x) + 0] = arr[4 * ((h - y) * w + x) + 0];
                            ret[4 * (y * w + x) + 1] = arr[4 * ((h - y) * w + x) + 1];
                            ret[4 * (y * w + x) + 2] = arr[4 * ((h - y) * w + x) + 2];
                            ret[4 * (y * w + x) + 3] = 255;
                        }
                    }
                    return ret;
                };
                break;
            case WebGLRenderingContext.RGBA:
                data = new dataArrayConstructor(width * height * 4);
                transformFunc = (w, h, arr) => {
                    const ret = new Uint8Array(w * h * 4);
                    for (let x = 0; x < w; x++) {
                        for (let y = 0; y < h; y++) {
                            ret[4 * (y * w + x) + 0] = arr[4 * ((h - y) * w + x) + 0];
                            ret[4 * (y * w + x) + 1] = arr[4 * ((h - y) * w + x) + 1];
                            ret[4 * (y * w + x) + 2] = arr[4 * ((h - y) * w + x) + 2];
                            ret[4 * (y * w + x) + 3] = arr[4 * ((h - y) * w + x) + 3];
                        }
                    }
                    return ret;
                };
                break;
            case WebGLRenderingContext.ALPHA:
                data = new dataArrayConstructor(width * height * 4);
                transformFunc = (w, h, arr) => {
                    const ret = new Uint8Array(w * h * 4);
                    for (let x = 0; x < w; x++) {
                        for (let y = 0; y < h; y++) {
                            ret[4 * (y * w + x) + 0] = arr[4 * (y * w + x)];
                            ret[4 * (y * w + x) + 1] = 0;
                            ret[4 * (y * w + x) + 2] = 0;
                            ret[4 * (y * w + x) + 3] = 255;
                        }
                    }
                    return ret;
                };
                break;
            default:
                console.error("Specified texture format is unsupported!");
                return;
        }
        transformFunc = encode || transformFunc;
        // read pixels from framebuffer
        this.GL.readPixels(0, 0, width, height, WebGLRenderingContext.RGBA, this.Parent.ElementFormat, data);
        this.GL.deleteFramebuffer(framebuffer);
        this.GL.bindFramebuffer(this.GL.FRAMEBUFFER, lastFBO);
        // generate canvas for result
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext("2d");
        // Copy the pixels to a 2D canvas
        const imageData = context.createImageData(width, height);
        imageData.data.set(transformFunc(width, height, data));
        context.putImageData(imageData, 0, 0);
        const img = new Image();
        img.src = canvas.toDataURL();
        return img;
    }
    /**
     * apply texture parameters
     */
    _applyTextureParameter() {
        if (this._targetTexture == null) {
            return;
        }
        this.bind();
        this.GL.texParameteri(this.Parent.TargetTextureType, WebGLRenderingContext.TEXTURE_MIN_FILTER, this._parent.MinFilter);
        this.GL.texParameteri(this.Parent.TargetTextureType, WebGLRenderingContext.TEXTURE_MAG_FILTER, this._parent.MagFilter);
        this.GL.texParameteri(this.Parent.TargetTextureType, WebGLRenderingContext.TEXTURE_WRAP_S, this._parent.SWrap);
        this.GL.texParameteri(this.Parent.TargetTextureType, WebGLRenderingContext.TEXTURE_WRAP_T, this._parent.TWrap);
    }
}
TextureWrapperBase.__altTextureBuffer = new Uint8Array([255, 0, 255, 255]);
export default TextureWrapperBase;