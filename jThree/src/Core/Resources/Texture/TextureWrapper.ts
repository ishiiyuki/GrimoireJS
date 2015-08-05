import TextureWrapperBase = require("./TextureWrapperBase");
import ContextManagerBase = require("../../ContextManagerBase");
import TextureTargetType = require("../../../Wrapper/TargetTextureType");
import TextureInternalFormat = require("../../../Wrapper/TextureInternalFormatType");
import Texture = require("./Texture");
import TextureType = require("../../../Wrapper/TextureType")
class TextureWrapper extends TextureWrapperBase
{
  constructor(contextManager:ContextManagerBase,parent:Texture)
  {
    super(contextManager,parent);
  }


  public init(isChanged?:boolean)
  {
    var parent=<Texture>this.Parent;
    if(this.Initialized&&!isChanged)return;
    if(this.TargetTexture==null)this.setTargetTexture(this.WebGLContext.CreateTexture());
    this.WebGLContext.BindTexture(TextureTargetType.Texture2D,this.TargetTexture);
    if(parent.ImageSource==null)
    {
      this.WebGLContext.TexImage2D(TextureTargetType.Texture2D, 0, TextureInternalFormat.RGBA, 1,1, 0,TextureType.UnsignedShort4444, null)
    }else{    
      this.WebGLContext.TexImage2D(TextureTargetType.Texture2D,0,TextureInternalFormat.RGBA,TextureInternalFormat.RGBA,TextureType.UnsignedByte,parent.ImageSource);
    }
    this.applyTextureParameter();
    this.WebGLContext.BindTexture(TextureTargetType.Texture2D,null);
    this.setInitialized();}

  }


export = TextureWrapper;
