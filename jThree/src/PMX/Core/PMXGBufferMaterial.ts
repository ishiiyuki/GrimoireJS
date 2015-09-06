﻿import Material = require('../../Core/Materials/Material');
import Program = require("../../Core/Resources/Program/Program");
import RendererBase = require("../../Core/Renderers/RendererBase");
import Geometry = require("../../Core/Geometries/Geometry");
import SceneObject = require("../../Core/SceneObject");
import Matrix = require("../../Math/Matrix");
import GLFeatureType = require("../../Wrapper/GLFeatureType");
import Scene = require('../../Core/Scene');
import PMXMaterial = require('./PMXMaterial');
import ResolvedChainInfo = require('../../Core/Renderers/ResolvedChainInfo');
import PMXGeometry = require('./PMXGeometry');
import Vector4 = require("../../Math/Vector4");
import PMXMaterialParamContainer = require("./PMXMaterialMorphParamContainer");

declare function require(string): string;
/**
 * the materials for PMX.
 */
class PMXGBufferMaterial extends Material
{
    protected primaryProgram: Program;

    protected secoundaryProgram: Program;

    protected thirdProgram: Program;

    protected associatedMaterial: PMXMaterial;
    
    /**
     * Count of verticies
     */
    public get VerticiesCount()
    {
        return this.associatedMaterial.VerticiesCount;
    }
    
    /**
     * Offset of verticies in index buffer
     */
    public get VerticiesOffset()
    {
        return this.associatedMaterial.VerticiesOffset;
    }

    constructor(material: PMXMaterial)
    {
        super();
        this.associatedMaterial = material;
        var vs = require('../Shader/PMXGBufferVertex.glsl');
        var fs = require('../Shader/PMXPrimaryGBufferFragment.glsl');
        this.primaryProgram = this.loadProgram("jthree.shaders.vertex.pmx.gbuffer", "jthree.shaders.fragment.pmx.gbuffer", "jthree.programs.pmx.gbuffer", vs, fs);
        var fs = require('../Shader/PMXSecoundaryGBufferFragment.glsl');
        this.secoundaryProgram = this.loadProgram("jthree.shaders.vertex.pmx.gbuffer.s", "jthree.shaders.fragment.gbuffer.s", "jthree.programs.pmx.gbuffer.s", vs, fs);
        this.setLoaded();
    }

    public configureMaterial(scene: Scene, renderer: RendererBase, object: SceneObject, texs: ResolvedChainInfo, pass?: number): void
    {
        if (!this.primaryProgram||this.associatedMaterial.Diffuse.A<1.0E-3) return;
        super.configureMaterial(scene, renderer, object, texs);
        switch (pass) {
            case 0:
                this.configurePrimaryBuffer(scene, renderer, object, texs, pass);
                break;
            case 1:
                this.configureSecoundaryBuffer(scene, renderer, object, texs, pass);
                break;

        }
        object.Geometry.bindIndexBuffer(renderer.ContextManager);
    }

    private configurePrimaryBuffer(scene: Scene, renderer: RendererBase, object: SceneObject, texs: ResolvedChainInfo, pass?: number) {
        var geometry = <PMXGeometry>object.Geometry;
        var programWrapper = this.primaryProgram.getForContext(renderer.ContextManager);
        var v = Matrix.multiply(renderer.Camera.ProjectionMatrix, renderer.Camera.ViewMatrix);
        programWrapper.register({
            attributes: {
                position: geometry.PositionBuffer,
                normal: geometry.NormalBuffer,
                boneWeights: geometry.boneWeightBuffer,
                boneIndicies: geometry.boneIndexBuffer,
                uv:geometry.UVBuffer
            },
            uniforms: {
                u_boneMatricies: { type: "texture", value: this.associatedMaterial.ParentModel.Skeleton.MatrixTexture, register: 0 },
                matVP: { type: "matrix", value: v },
                matV: { type: "matrix", value: Matrix.multiply(renderer.Camera.ViewMatrix, object.Transformer.LocalToGlobal) },
                specularCoefficient: { type: "float", value: this.associatedMaterial.Specular.W },
                u_boneCount: { type: "float", value: this.associatedMaterial.ParentModel.Skeleton.BoneCount }
            }
        });
    }

    private configureSecoundaryBuffer(cene: Scene, renderer: RendererBase, object: SceneObject, texs: ResolvedChainInfo, pass?: number) {
        var geometry = <PMXGeometry>object.Geometry;
        var programWrapper = this.secoundaryProgram.getForContext(renderer.ContextManager);
        var v = Matrix.multiply(renderer.Camera.ProjectionMatrix, renderer.Camera.ViewMatrix);
        programWrapper.register({
            attributes: {
                position: geometry.PositionBuffer,
                normal: geometry.NormalBuffer,
                boneWeights: geometry.boneWeightBuffer,
                boneIndicies: geometry.boneIndexBuffer,
                uv:geometry.UVBuffer
            },
            uniforms: {
                u_boneMatricies: { type: "texture", value: this.associatedMaterial.ParentModel.Skeleton.MatrixTexture, register: 0 },
                matVP: { type: "matrix", value: v },
                matV: { type: "matrix", value: Matrix.multiply(renderer.Camera.ViewMatrix, object.Transformer.LocalToGlobal) },
                specularCoefficient: { type: "float", value: this.associatedMaterial.Specular.W },
                u_boneCount: { type: "float", value: this.associatedMaterial.ParentModel.Skeleton.BoneCount },
                diffuse: {
                    type: "vector",
                    value: PMXMaterialParamContainer.calcMorphedVectorValue(this.associatedMaterial.Diffuse.toVector(), this.associatedMaterial.addMorphParam, this.associatedMaterial.mulMorphParam, (t) => t.diffuse, 4)
                },
                texture: {
                    type: "texture",
                    value: this.associatedMaterial.Texture,
                    register: 1
                },
                sphere: {
                    type: "texture",
                    value: this.associatedMaterial.Sphere,
                    register: 2
                },
                textureUsed: {
                    type: "integer",
                    value: this.associatedMaterial.Texture == null || this.associatedMaterial.Texture.ImageSource == null ? 0 : 1
                },
                sphereMode: {
                    type: "integer",
                    value: this.associatedMaterial.Sphere == null || this.associatedMaterial.Sphere.ImageSource == null ? 0 : this.associatedMaterial.SphereMode
                },
                addTextureCoefficient: { type: "vector", value: new Vector4(this.associatedMaterial.addMorphParam.textureCoeff) },
                mulTextureCoefficient: { type: "vector", value: new Vector4(this.associatedMaterial.mulMorphParam.textureCoeff) },
                addSphereCoefficient: { type: "vector", value: new Vector4(this.associatedMaterial.addMorphParam.sphereCoeff) },
                mulSphereCoefficient: { type: "vector", value: new Vector4(this.associatedMaterial.mulMorphParam.sphereCoeff) }

            }
        });

    }

    public get Priorty(): number
    {
        return 100;
    }

    public getDrawGeometryLength(geo: Geometry): number
    {
        return this.VerticiesCount;
    }

    public getDrawGeometryOffset(geo: Geometry): number
    {
        return this.VerticiesOffset * 4;
    }

    public get MaterialGroup(): string
    {
        return "jthree.materials.gbuffer";
    }
}

export =PMXGBufferMaterial;