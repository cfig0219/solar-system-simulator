// Rings.js

export class Rings {
    /**
     * Initializes the Rings class
     * @param {number} planetRadius - The radius of the planet to adjust clip planes
     * @param {BABYLON.Vector3} planetLocation - Position in 3D space
     * @param {BABYLON.Light} starLight1 - Primary light source
     * @param {number} starIntensity1 - Intensity of the primary light source
     * @param {BABYLON.Vector3} starPosition1 - Position of the primary star
     * @param {BABYLON.Light} starLight2 - Secondary light source for shadow
     * @param {number} starIntensity2 - Intensity of the secondary light source
     * @param {BABYLON.scene} scene - The Babylon scene
     * @param {BABYLON.camera} camera - The camera to adjust ring rotation relative to view
     */
    constructor(planetRadius, planetLocation, starLight1, starIntensity1, starPosition1, scene, camera) {
        this.planetRadius = planetRadius;
        this.planetLocation = planetLocation;
        this.ringTexture = new BABYLON.Texture('Textures/Rings/ringsTexture.png', scene);
        this.ringColor = new BABYLON.Color3(0.6, 0.6, 0.6);
        this.ringIn = planetRadius * 3;
        this.ringOut = planetRadius * 4;
        
        this.starLight1 = starLight1;
        this.starIntensity1 = starIntensity1;
        this.starPosition1 = starPosition1;
        this.starLight2 = new BABYLON.Color3(0, 0, 0);
        this.starIntensity2 = 0;
        this.scene = scene;
        this.camera = camera;

        this.createRings();
    }
    
    createRings () {
    	  // Shared properties for the ring
          this.ringTexture.hasAlpha = true;
          
          // Ring Torus
          this.ringTorus = BABYLON.MeshBuilder.CreateTorus("ringTorus", {
              diameter: this.ringOut,
              thickness: (this.ringOut - this.ringIn),
              tessellation: 64
          }, this.scene);
          
          this.ringTorus.scaling = new BABYLON.Vector3(1, 0.0001, 1);
          const ringMaterial = new BABYLON.StandardMaterial("ringTorusMat", this.scene);
          
          ringMaterial.diffuseTexture = this.ringTexture;
          ringMaterial.useAlphaFromDiffuseTexture = true;
          ringMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
          ringMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
          ringMaterial.emissiveColor = this.ringColor.multiply(this.starLight1.scale(this.starIntensity1));
          this.ringTorus.material = ringMaterial;
          this.ringTorus.position = this.planetLocation;
          
          // Front Ring
          this.ring2Torus = BABYLON.MeshBuilder.CreateTorus("ring2Torus", {
              diameter: this.ringOut,
              thickness: (this.ringOut - this.ringIn),
              tessellation: 64
          }, this.scene);
          
          this.ring2Torus.scaling = new BABYLON.Vector3(1, 0.0001, 1);
          const ring2Material = new BABYLON.StandardMaterial("ringTorusMat", this.scene);
          
          ring2Material.diffuseTexture = this.ringTexture;
          ring2Material.useAlphaFromDiffuseTexture = true;
          ring2Material.diffuseColor = new BABYLON.Color3(0, 0, 0);
          ring2Material.specularColor = new BABYLON.Color3(0, 0, 0);
          ring2Material.emissiveColor = this.ringColor.multiply(this.starLight1.scale(this.starIntensity1));
          this.ring2Torus.material = ring2Material;
          this.ring2Torus.position = this.planetLocation;
          
          // Clipping of Ring
          ringMaterial.clipPlane = new BABYLON.Plane(1, 0, 0, -this.planetRadius);
          ring2Material.clipPlane = new BABYLON.Plane(-1, 0, 0, this.planetRadius);
          
          
          // Shadow Torus
          this.shadowTorus = BABYLON.MeshBuilder.CreateTorus("shadowTorus", {
              diameter: this.ringOut,
              thickness: (this.ringOut - this.ringIn),
              tessellation: 64
          }, this.scene);
          
          this.shadowTorus.scaling = new BABYLON.Vector3(1, 0.002, 1);
          const shadowMaterial = new BABYLON.StandardMaterial("shadowTorusMat", this.scene);
          shadowMaterial.diffuseTexture = this.ringTexture;
          shadowMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
          shadowMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
          
          // Makes shadow same color as second star
          shadowMaterial.emissiveColor = this.ringColor.multiply(this.starLight2.scale(this.starIntensity2));
          this.shadowTorus.material = shadowMaterial;
          this.shadowTorus.position = this.planetLocation;
          
          // Calculates position of main star (this.starPosition1)
          const planetPosition = this.planetLocation;
    	  const directionToStar = this.starPosition1.subtract(planetPosition).normalize();  // Get direction vector from planet to star
    	  const rotationMatrix = BABYLON.Matrix.RotationY(3 * Math.PI / 2);  // 270 degrees in radians
    	  const correctedDirectionToStar = BABYLON.Vector3.TransformCoordinates(directionToStar, rotationMatrix);
    	  
          // Update clip planes based on the star's relative position to the planet, centered at this.planetLocation
          shadowMaterial.clipPlane2 = new BABYLON.Plane(
              correctedDirectionToStar.x,
              0,
              correctedDirectionToStar.z,
              -this.planetRadius - BABYLON.Vector3.Dot(this.planetLocation, new BABYLON.Vector3(correctedDirectionToStar.x, 0, correctedDirectionToStar.z))
          );
          
          shadowMaterial.clipPlane3 = new BABYLON.Plane(
              -correctedDirectionToStar.x,
              0,
              -correctedDirectionToStar.z,
              -this.planetRadius - BABYLON.Vector3.Dot(this.planetLocation, new BABYLON.Vector3(-correctedDirectionToStar.x, 0, -correctedDirectionToStar.z))
          );
          
          shadowMaterial.clipPlane4 = new BABYLON.Plane(
              correctedDirectionToStar.z,
              0,
              -correctedDirectionToStar.x,
              -this.planetRadius - BABYLON.Vector3.Dot(this.planetLocation, new BABYLON.Vector3(correctedDirectionToStar.z, 0, -correctedDirectionToStar.x))
          );
    
          
          // Get the star's horizontal angle relative to the planet (in the XZ plane)
          const starAngleY = Math.atan2(correctedDirectionToStar.z, correctedDirectionToStar.x);
          
          // Set rendering group IDs
          this.shadowTorus.renderingGroupId = 1;
          this.ringTorus.renderingGroupId = 0;
          this.ring2Torus.renderingGroupId = 2;
          
          
          // Rotates rings to follow this.camera
          this.scene.registerBeforeRender(() => {
              // Get player's position relative to the planet
              const playerPosition = this.camera.position;
              const planetPosition = this.planetLocation;
              const deltaX = playerPosition.x - planetPosition.x;
              const deltaZ = playerPosition.z - planetPosition.z;
          
              // Calculate the player's horizontal angle relative to the planet (in the XZ plane)
              const playerAngleY = Math.atan2(deltaZ, deltaX);
          
              // Update the clipping planes based on player's angle
              ringMaterial.clipPlane = new BABYLON.Plane(
              	  Math.cos(playerAngleY), 
              	  0, 
              	  Math.sin(playerAngleY), 
              	  -this.planetRadius - BABYLON.Vector3.Dot(this.planetLocation, new BABYLON.Vector3(Math.cos(playerAngleY), 0, Math.sin(playerAngleY))));
              
              ring2Material.clipPlane = new BABYLON.Plane(
              	  -Math.cos(playerAngleY), 
              	  0, 
              	  -Math.sin(playerAngleY), 
              	  this.planetRadius - BABYLON.Vector3.Dot(this.planetLocation, new BABYLON.Vector3(-Math.cos(playerAngleY), 0, -Math.sin(playerAngleY))));
              
              // Convert player's and star's angles to degrees
              let playerAngleYDegrees = BABYLON.Tools.ToDegrees(playerAngleY) + 180; // Convert to degrees
              let starDirection = Math.atan2(directionToStar.z, directionToStar.x); // uses unmodified direction
              let starAngleYDegrees = BABYLON.Tools.ToDegrees(starDirection) + 180; // Star angle in degrees
              const threshold = 90;
              
              // Check angle thresholds in degrees
              let lowerThreshold = starAngleYDegrees - threshold
              let upperThreshold = starAngleYDegrees + threshold
              
              // checks if thresholds exceed 360 or are under 0
              if (lowerThreshold < 0) {
                  lowerThreshold = lowerThreshold + 360
              }
              if (upperThreshold > 360) {
                  upperThreshold = upperThreshold - 360
              }
              
              // Swap the thresholds if lowerThreshold becomes greater than upperThreshold
              let swapped = false;
              if (lowerThreshold > upperThreshold) {
                  let temp = lowerThreshold;
                  lowerThreshold = upperThreshold;
                  upperThreshold = temp;
                  swapped = true; // sets swapped to true if swapped
              }
              
              if (playerAngleYDegrees > lowerThreshold && playerAngleYDegrees < upperThreshold) {
                  this.shadowTorus.renderingGroupId = 1;
                  this.ringTorus.renderingGroupId = 0;
                  // reverses shadow generation logic if lower and upper values were swapped
                  if (swapped == true) {
                  	  this.shadowTorus.renderingGroupId = 3;
                  	  this.ringTorus.renderingGroupId = 1;
                  }
              } else {
                  this.shadowTorus.renderingGroupId = 3;
                  this.ringTorus.renderingGroupId = 1; // insures that ring renders in front of nearby planets
                  if (swapped == true) {
                  	  this.shadowTorus.renderingGroupId = 1;
                  	  this.ringTorus.renderingGroupId = 0; // insures that ring does not overlap with its shadow
                  }
              }
    	 });
    }
	
	
	// Sets the ring color
    setRingColor(color) {
        this.ringColor = color;
        this.ringTorus.material.emissiveColor = color.multiply(this.starLight1.scale(this.starIntensity1));
        this.ring2Torus.material.emissiveColor = color.multiply(this.starLight1.scale(this.starIntensity1));
        this.shadowTorus.material.emissiveColor = color.multiply(this.starLight2.scale(this.starIntensity2));
    }
    
    // Sets the color of the second light
    setSecondLight(starLight2, starIntensity2) {
    	this.starLight2 = starLight2;
    	this.starIntensity2 = starIntensity2;
    	this.shadowTorus.material.emissiveColor = this.ringColor.multiply(this.starLight2.scale(this.starIntensity2));
    }
}