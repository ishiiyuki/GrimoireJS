import BasicMaterial from "../Base/BasicMaterial";
import Vector4 from "../../../Math/Vector4";
class HitAreaMaterial extends BasicMaterial {
    constructor() {
        super(require("../BuiltIn/HitAreaTest.html"));
    }
    apply(matArg) {
        const r = (0xFF00 & matArg.renderStage.___objectIndex) >> 16;
        const g = 0x00FF & matArg.renderStage.___objectIndex;
        this.materialVariables["indexColor"] = new Vector4(r / 0xFF, g / 0xFF, 0, 1);
        super.apply(matArg);
    }
}
export default HitAreaMaterial;