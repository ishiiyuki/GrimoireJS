import GomlTreeNodeBase = require("../../../GomlTreeNodeBase");
import SceneObjectNodeBase = require("../SceneObjectNodeBase");
import GomlTreeSceneNode = require("../../SceneNode");
import LightNodeBase = require('./LightNodeBase');
import SpotLight = require('../../../../Core/Light/Impl/SpotLight');
import LightBase =require('../../../../Core/Light/LightBase');
class SpotLightNode extends LightNodeBase
{
	private targetLight:SpotLight;

		constructor(parent: GomlTreeNodeBase, parentSceneNode: GomlTreeSceneNode, parentObject: SceneObjectNodeBase) {
		super(parent, parentSceneNode, parentObject);
		this.attributes.defineAttribute({
			"intensity":{
				value:1,converter:"number",handler:(v)=>{this.targetLight.intensity=v.Value;}
			},
			"decay":
			{
				value:1,converter:"number",handler:(v)=>{this.targetLight.decay=v.Value;}
			},
      "inner":
      {
        value:"10d",converter:"angle",handler:(v)=>{
          this.targetLight.inner = v.Value;
        }
      },
      "outer":{
        value:"25d",
        converter:"angle",
        handler:(v)=>{
          this.targetLight.outer = v.Value;
        }
      }

		});
	}

	protected constructLight():LightBase
	{
		this.targetLight= new SpotLight(this.ContainedSceneNode.targetScene);
		return this.targetLight;
	}
}
export = SpotLightNode;
