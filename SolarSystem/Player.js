export class Player {
    /**
     * Initializes the Player class
     */
    constructor(camera, scene) {
        this.camera = camera;
        this.camera.maxZ = 12000000000000;
        this.camera.minZ = 50; // Prevents jittering of layers when adjusted for distance

        // Make zoom 10x faster for mouse wheel (PC)
        this.camera.wheelDeltaPercentage = 0.01; // Default is 0.001, so this is 10x faster
        // Adjust zoom speed for pinch gestures (mobile)
        this.camera.pinchDeltaPercentage = 0.001; // Default is 0.0001, so this is 10x faster on mobile

        // Initialize velocity and previous velocity
        this.velocity = new BABYLON.Vector3(0, 0, 0);
        this.previousVelocity = this.velocity.clone();
        const acceleration = 1.55; // Adjust acceleration as needed

        // Initialize accumulation variables for acceleration
        this.velocityChangeAccumulator = new BABYLON.Vector3(0, 0, 0);
        this.accumulatedTime = 0;

        // Function to handle key down events and adjust velocity
        window.addEventListener("keydown", (event) => {
            // Calculate forward and right vectors relative to the camera's current orientation
            const forward = this.camera.getFrontPosition(1).subtract(this.camera.position).normalize();
            const right = BABYLON.Vector3.Cross(forward, BABYLON.Vector3.Up()).normalize();
            const up = BABYLON.Vector3.Up(); // Y-axis direction for up and down movement

            switch (event.key) {
                case "w": // Accelerate forward
                    this.velocity.addInPlace(forward.scale(acceleration));
                    break;
                case "s": // Accelerate backward
                    this.velocity.addInPlace(forward.scale(-acceleration));
                    break;
                case "a": // Accelerate left
                    this.velocity.addInPlace(right.scale(acceleration));
                    break;
                case "d": // Accelerate right
                    this.velocity.addInPlace(right.scale(-acceleration));
                    break;
                case "r": // Move up
                    this.velocity.addInPlace(up.scale(acceleration));
                    break;
                case "f": // Move down
                    this.velocity.addInPlace(up.scale(-acceleration));
                    break;
            }
        });

        // Create displays for speed and acceleration
        this.createVelocityDisplay();
        this.createAccelerationDisplay();

        // Update camera position and calculate acceleration in each render loop
        scene.onBeforeRenderObservable.add(() => {
            const deltaTime = scene.getEngine().getDeltaTime() / 1000; // Time in seconds

            // Update camera position based on velocity
            this.camera.target.addInPlace(this.velocity);
            this.camera.position.addInPlace(this.velocity);

            // Display current speed
            this.displayVelocity();

            // Accumulate velocity change and calculate acceleration every second
            this.accumulateAcceleration(deltaTime);
            
            // Update previous velocity for the next frame
            this.previousVelocity.copyFrom(this.velocity);
        });
    }

    // Function to create a DOM element to display the velocity
    createVelocityDisplay() {
        this.velocityDisplay = document.createElement("div");
        this.velocityDisplay.style.position = "absolute";
        this.velocityDisplay.style.bottom = "30px";
        this.velocityDisplay.style.left = "10px";
        this.velocityDisplay.style.color = "white";
        this.velocityDisplay.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
        this.velocityDisplay.style.padding = "5px";
        this.velocityDisplay.style.borderRadius = "5px";
        this.velocityDisplay.style.fontFamily = "Arial, sans-serif";
        this.velocityDisplay.style.fontSize = "14px";
        document.body.appendChild(this.velocityDisplay);
    }

    // Function to create a DOM element to display the acceleration
    createAccelerationDisplay() {
        this.accelerationDisplay = document.createElement("div");
        this.accelerationDisplay.style.position = "absolute";
        this.accelerationDisplay.style.bottom = "10px";
        this.accelerationDisplay.style.left = "10px";
        this.accelerationDisplay.style.color = "white";
        this.accelerationDisplay.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
        this.accelerationDisplay.style.padding = "5px";
        this.accelerationDisplay.style.borderRadius = "5px";
        this.accelerationDisplay.style.fontFamily = "Arial, sans-serif";
        this.accelerationDisplay.style.fontSize = "14px";
        document.body.appendChild(this.accelerationDisplay);
    }

    // Function to calculate and display the current speed in meters per second
    displayVelocity() {
        const speed = this.velocity.length(); // Magnitude of the velocity vector
        this.velocityDisplay.innerText = `Speed: ${speed.toFixed(2)} m/s`;
    }

    // Function to accumulate velocity changes and display average acceleration per second
    accumulateAcceleration(deltaTime) {
        // Calculate the change in velocity for this frame
        const velocityChange = this.velocity.subtract(this.previousVelocity);
        
        // Accumulate the change in velocity
        this.velocityChangeAccumulator.addInPlace(velocityChange);
        this.accumulatedTime += deltaTime;

        // If one second has passed, calculate and display acceleration
        if (this.accumulatedTime >= 1) {
            const acceleration = this.velocityChangeAccumulator.length(); // Magnitude of accumulated change
            this.accelerationDisplay.innerText = `Acceleration: ${acceleration.toFixed(2)} m/s²`;

            // Reset accumulator and time
            this.velocityChangeAccumulator.set(0, 0, 0);
            this.accumulatedTime = 0;
        }
    }
}