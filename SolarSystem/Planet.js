// Planet.js

export class Planet {
    /**
     * Initializes the Planet class
     * @param {number} planetRadius - The radius of the planet
     * @param {BABYLON.Vector3} planetLocation - Position in 3D space
     * @param {BABYLON.Scene} scene - The Babylon scene
     * @param {BABYLON.camera} camera - The camera to adjust ring rotation relative to view
     */
    constructor(planetRadius, planetLocation, scene, camera) {
        this.planetRadius = planetRadius;
        this.planetLocation = planetLocation;
        this.planetTexture = new BABYLON.Texture('Textures/Eden/EdenMap.png', scene);
        this.landTexture = new BABYLON.Texture('Textures/Eden/EdenLand.png', scene);
        this.cloudTexture = new BABYLON.Texture('Textures/Clouds/EarthClouds.png', scene);
        this.atmosphereOpacity = 0.27;
        this.atmosphereColor = new BABYLON.Color3(0.5, 0.7, 1);
        this.cloudColor = new BABYLON.Color3(1, 1, 1);
        this.scene = scene;

        // Initialize planet layers
        this.createBaseLayer();
        this.createLandLayer();
        this.createCloudLayer();
        this.createAtmosphere();

        // Initialize rotation speeds
        this.planetRotationSpeed = 0.001;
        this.landRotationSpeed = 0.001;
        this.cloudRotationSpeed = 0.0008;

        // Start rotation animation
        this.startRotation();
    }

    createBaseLayer() {
        this.planetTexture.vScale = -1;
        this.planetTexture.uScale = -1;

        this.sphere = BABYLON.MeshBuilder.CreateSphere("sphere", { diameter: this.planetRadius * 2 }, this.scene);
        const sphereMaterial = new BABYLON.StandardMaterial("sphereMaterial", this.scene);

        sphereMaterial.diffuseTexture = this.planetTexture;
        sphereMaterial.specularColor = new BABYLON.Color3(1, 0.9, 0.9);
        sphereMaterial.emissiveColor = new BABYLON.Color3(0, 0, 0);
        sphereMaterial.diffuseColor = new BABYLON.Color3(1, 1, 1).scale(1 - this.atmosphereOpacity);
        this.sphere.material = sphereMaterial;
        this.sphere.position = this.planetLocation;
        this.sphere.renderingGroupId = 1;
    }

    createLandLayer() {
        this.landTexture.vScale = -1;
        this.landTexture.uScale = -1;
        this.landTexture.hasAlpha = true;

        this.landLayer = BABYLON.MeshBuilder.CreateSphere("landLayer", { diameter: this.planetRadius * 2 }, this.scene);
        const landMaterial = new BABYLON.StandardMaterial("landMaterial", this.scene);

        landMaterial.diffuseTexture = this.landTexture;
        landMaterial.useAlphaFromDiffuseTexture = true;
        landMaterial.backFaceCulling = true;
        landMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        landMaterial.diffuseColor = new BABYLON.Color3(1, 1, 1).scale(1 - this.atmosphereOpacity);
        landMaterial.emissiveColor = new BABYLON.Color3(0, 0, 0);
        this.landLayer.material = landMaterial;
        this.landLayer.position = this.planetLocation;
        this.landLayer.renderingGroupId = 1;
    }

    createCloudLayer() {
        this.cloudTexture.vScale = -1;
        this.cloudTexture.uScale = -1;
        this.cloudTexture.hasAlpha = true;

        this.cloudLayer = BABYLON.MeshBuilder.CreateSphere("cloudLayer", { diameter: this.planetRadius * 2.005 }, this.scene);
        const cloudMaterial = new BABYLON.StandardMaterial("cloudMaterial", this.scene);

        cloudMaterial.diffuseTexture = this.cloudTexture;
        cloudMaterial.useAlphaFromDiffuseTexture = true;
        cloudMaterial.backFaceCulling = true;
        cloudMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        cloudMaterial.diffuseColor = this.cloudColor;
        this.cloudLayer.material = cloudMaterial;
        this.cloudLayer.position = this.planetLocation;
        this.cloudLayer.renderingGroupId = 1;
    }

    createAtmosphere() {
        const atmosphereMaterial = new BABYLON.StandardMaterial("atmosphereMaterial", this.scene);
        atmosphereMaterial.diffuseColor = this.atmosphereColor;
        atmosphereMaterial.alpha = this.atmosphereOpacity;
        atmosphereMaterial.specularColor = new BABYLON.Color3(0, 0, 0);

        const opacityFresnel = new BABYLON.FresnelParameters();
        opacityFresnel.bias = 0.6;
        opacityFresnel.power = (this.atmosphereOpacity * 2.34) + this.atmosphereOpacity;
        opacityFresnel.leftColor = new BABYLON.Color3(1, 1, 1);
        opacityFresnel.rightColor = new BABYLON.Color3(0.0, 0.0, 0.0);
        atmosphereMaterial.opacityFresnelParameters = opacityFresnel;

        this.atmosphere = BABYLON.MeshBuilder.CreateSphere("atmosphere", { diameter: this.planetRadius * 2.007 }, this.scene);
        this.atmosphere.material = atmosphereMaterial;
        this.atmosphere.position = this.planetLocation;
        this.atmosphere.renderingGroupId = 1;
    }

    startRotation() {
        this.scene.registerBeforeRender(() => {
            this.sphere.rotation.y -= this.planetRotationSpeed;
            this.landLayer.rotation.y -= this.landRotationSpeed;
            this.cloudLayer.rotation.y -= this.cloudRotationSpeed;
        });
    }
    
    
    // Functions to set the planet surface and cloud textures
    setTexture(newPlanetTexture) {
    	this.planetTexture = newPlanetTexture;
    	this.sphere.material.diffuseTexture = this.planetTexture;
    }
    
    setLand(newLandTexture) {
    	this.landTexture = newLandTexture;
    	this.landTexture.hasAlpha = true;
    	this.landLayer.material.diffuseTexture = this.landTexture;
    }
    
    setClouds(newCloudTexture) {
    	this.cloudTexture = newCloudTexture;
    	this.cloudTexture.hasAlpha = true;
    	this.cloudLayer.material.diffuseTexture = this.cloudTexture;
    }
    
    // Functions to alter atmosphere and cloud colors
    setAtmosphereColor(newAtmosphereColor) {
    	this.atmosphereColor = newAtmosphereColor;
    	this.atmosphere.material.diffuseColor = this.atmosphereColor;
    }
    
    setCloudColor(newCloudColor) {
    	this.cloudColor = newCloudColor;
    	this.cloudLayer.material.diffuseColor = this.cloudColor;
    }
    
    setAtmosphereOpacity(newOpacity) {
    	this.atmosphereOpacity = newOpacity;
    	this.atmosphere.material.alpha = newOpacity;
    }
}
