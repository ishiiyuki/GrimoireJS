import DefaultPluginDeclarationBase from "../DefaultPluginDeclarationBase";
import GrimoireInterface from "../../GrimoireInterface";
import IAttributeDeclaration from "../IAttributeDeclaration";
import Component from "../Component";
import NamespacedIdentity from "../../Base/NamespacedIdentity";

class DummyComponent extends Component implements DefaultPluginDeclarationBase {

  public dummyMethod(arg: string): void {

    const value = this.attributes.get("testAttr").Value;
  }

  public register(): void {
    let id = new NamespacedIdentity("dummy");
    const bb: IAttributeDeclaration = { converter: "stringconverter", defaultValue: "hoge" };
    const n: { [key: string]: IAttributeDeclaration } = {};
    n["testAttr"] = bb;
    GrimoireInterface.registerComponent(id, n, DummyComponent);
  }
}

export default DummyComponent;
