import Program = require("../../Resources/Program/Program");
import Shader = require("../../Resources/Shader/Shader");
import ShaderType = require("../../../Wrapper/ShaderType");
import ContextComponents = require("../../../ContextComponents");
import JThreeContext = require("../../../JThreeContext");
import ResourceManager = require("../../ResourceManager");
import XMMLShaderParser = require("./XMMLShaderParser");
class MaterialPass {

    public fragmentShaderSource: string;

    public vertexShaderSource: string;

    public fragmentShader:Shader;

    public vertexShader:Shader;

    public program:Program;

    constructor(passDocument: Element,materialName:string,index:number) {
      this._parseGLSL(passDocument);
      this._constructProgram(materialName + index);
      this._configureUniformRegisters(passDocument);
    }

    private _parseGLSL(passDocument:Element):void{
      var shaderCode = passDocument.getElementsByTagName("glsl").item(0).textContent;
      var parsedCodes = XMMLShaderParser.parseCombined(shaderCode);
      this.fragmentShaderSource = parsedCodes.fragment;
      this.vertexShaderSource = parsedCodes.vertex;
    }

    private _constructProgram(idPrefix:string):void
    {
      this.fragmentShader = MaterialPass._resourceManager.createShader(idPrefix + "-fs",this.fragmentShaderSource,ShaderType.FragmentShader);
      this.vertexShader = MaterialPass._resourceManager.createShader(idPrefix + "-vs",this.fragmentShaderSource,ShaderType.VertexShader);
      this.fragmentShader.loadAll();
      this.vertexShader.loadAll();
      this.program = MaterialPass._resourceManager.createProgram(idPrefix + "-program",[this.vertexShader,this.fragmentShader]);
    }

    private _configureUniformRegisters(passDocument:Element)
    {

    }

    private static get _resourceManager():ResourceManager
    {
      return JThreeContext.getContextComponent<ResourceManager>(ContextComponents.ResourceManager);
    }
}

export = MaterialPass;
