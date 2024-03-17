varying float vDistance;// Receive the distance from the vertex shader

void main() {
    // Map the distance to a brightness value
    float brightness = vDistance * 0.6;

    // Ensure brightness is within a valid range
    brightness = clamp(brightness, 0.0, 1.0);

    // Set the color
    gl_FragColor = vec4(0.5, 0.8, 0.3, 1.0);// Grayscale based on distance
}
