export class Star {
    /**
     * Creates a star with godrays effect
     * @param {BABYLON.Color3} starLight - The color of the star
     * @param {number} starRadius - The radius of the star
     * @param {number} starDistance - Distance from the center
     * @param {BABYLON.Vector3} starPosition - Position in 3D space
     * @param {number} habitableZone - The habitable zone distance
     * @param {BABYLON.Scene} scene - The Babylon scene
     * @param {BABYLON.Camera} camera - The camera
     */
    constructor(starLight, starRadius, starPosition, habitableZone, scene, camera) {
        this.starLight = starLight;
        this.starRadius = starRadius;
        this.starPosition = starPosition;
        this.habitableZone = habitableZone;
        this.mainStar = false;
        this.scene = scene;
        this.camera = camera;
        
        // Calculate the initial distance between the camera and the star
    	this.starDistance = BABYLON.Vector3.Distance(this.camera.position, this.starPosition);
    	// Calculate the adjusted star light intensity and star light scale
    	this.imageScale = 0;
        
        // Set up the star elements in the scene
        this.createLightSphere();
        this.createPointLight();
        this.createVolumetricLight();
        this.createImagePlane();
    }
	
	
	// Calculates the intensity of the star's light
    calculateIntensity(planetPosition, starPosition) {
    	const currentDistance = BABYLON.Vector3.Distance(planetPosition, starPosition);
        const maxDistance = this.habitableZone * 2;
        const minIntensity = 0.01;
        const maxIntensity = 1.0;
        return BABYLON.Scalar.Clamp(maxDistance / currentDistance, minIntensity, maxIntensity);
    }

    createLightSphere() {
        this.lightSphere = BABYLON.MeshBuilder.CreateSphere("lightSphere", { diameter: this.starRadius * 2 }, this.scene);
        const lightMaterial = new BABYLON.StandardMaterial("lightMaterial", this.scene);
        const starTexture = new BABYLON.Texture('Textures/Stars/starMap.jpg', this.scene);

        lightMaterial.diffuseTexture = starTexture;
        lightMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
        lightMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        lightMaterial.emissiveColor = this.starLight;
        this.lightSphere.material = lightMaterial;
        this.lightSphere.position = this.starPosition;
        this.lightSphere.renderingGroupId = 1; // insures that star renders in front of planets
    }

    createPointLight() {
        this.pointLight = new BABYLON.PointLight("pointLight", this.starPosition, this.scene);
        this.pointLight.diffuse = this.starLight;
        this.pointLight.specular = this.starLight;
        this.pointLight.radius = 500;
        
        // allows for light to fade with distance
        this.pointLight.falloffType = BABYLON.Light.FALLOFF_PHYSICAL;
        this.pointLight.range = this.habitableZone * 10;
    }
	
	
	// Creates volumetric light with god rays affect
    createVolumetricLight() {
        if (this.starDistance < (this.starRadius * 200)) {
            this.volLight = new BABYLON.VolumetricLightScatteringPostProcess(
                "godrays",
                1.0,
                this.camera,
                this.lightSphere,
                100,
                BABYLON.Texture.BILINEAR_SAMPLINGMODE,
                this.scene.getEngine(),
                false
            );
            this.volLight.exposure = 0.3;
            this.volLight.decay = 0.97;
            this.volLight.weight = 0.7;
            this.volLight.density = 0.8;
        }
    }
	
    createImagePlane() {
        this.imagePlane = BABYLON.MeshBuilder.CreatePlane("imagePlane", { width: this.imageScale, height: this.imageScale / 2 }, this.scene);
        const imageMaterial = new BABYLON.StandardMaterial("imageMaterial", this.scene);
        const imageTexture = new BABYLON.Texture('Textures/Stars/starLight.png', this.scene);

        imageTexture.hasAlpha = true;
        imageMaterial.diffuseTexture = imageTexture;
        imageMaterial.alpha = 0.8;
        imageMaterial.useAlphaFromDiffuseTexture = true;
        imageMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
        imageMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        imageMaterial.emissiveColor = this.starLight;
        this.imagePlane.material = imageMaterial;

        imageMaterial.backFaceCulling = true;
        this.imagePlane.position = this.starPosition;
        this.imagePlane.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
        this.imagePlane.renderingGroupId = 0;
        
        // Continuously updates the size of the star flare relative to camera location
        this.scene.registerBeforeRender(() => {
        	console.log("Image Scale:", this.starDistance);
            this.starDistance = BABYLON.Vector3.Distance(this.camera.position, this.starPosition);
        	this.imageScale = (((this.starDistance) / 30) * (Math.pow(this.starRadius, 1/2) / 30)) * (Math.pow((1/this.starDistance), 1/10));
			
        	// Update the scaling of the imagePlane directly
        	this.imagePlane.scaling.x = this.imageScale;
        	this.imagePlane.scaling.y = this.imageScale / 2;
        });
    }
	
}