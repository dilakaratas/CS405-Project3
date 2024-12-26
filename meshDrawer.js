/**
 * @class MeshDrawer
 * @description Helper class for rendering meshes with lighting and textures.
 */
class MeshDrawer {
    constructor(isLightSource = false) {
        // Compile shader program
        this.program = InitShaderProgram(meshVS, meshFS);

        // Attribute locations
        this.attributes = {
            position: gl.getAttribLocation(this.program, 'position'),
            normal: gl.getAttribLocation(this.program, 'normal'),
            texCoord: gl.getAttribLocation(this.program, 'texCoord'),
        };

        // Uniform locations
        this.uniforms = {
            mvp: gl.getUniformLocation(this.program, 'mvp'),
            mv: gl.getUniformLocation(this.program, 'mv'),
            normalMV: gl.getUniformLocation(this.program, 'normalMV'),
            modelMatrix: gl.getUniformLocation(this.program, 'modelMatrix'),
            isLightSource: gl.getUniformLocation(this.program, 'isLightSource'),
            textureSampler: gl.getUniformLocation(this.program, 'tex'),
        };

        // Buffers
        this.buffers = {
            position: gl.createBuffer(),
            normal: gl.createBuffer(),
            texCoord: gl.createBuffer(),
        };

        this.texture = gl.createTexture();
        this.numTriangles = 0;
        this.isLightSource = isLightSource;
    }

    /**
     * Sets the mesh data.
     * @param {Float32Array} positions - Vertex positions.
     * @param {Float32Array} texCoords - Texture coordinates.
     * @param {Float32Array} normals - Vertex normals.
     */
    setMesh(positions, texCoords, normals) {
        this.#uploadBuffer(this.buffers.position, positions);
        this.#uploadBuffer(this.buffers.normal, normals);
        this.#uploadBuffer(this.buffers.texCoord, texCoords);
        this.numTriangles = positions.length / 3;
    }

    /**
     * Draws the mesh using provided transformation matrices.
     * @param {Float32Array} mvpMatrix - Model-View-Projection matrix.
     * @param {Float32Array} mvMatrix - Model-View matrix.
     * @param {Float32Array} normalMatrix - Normal transformation matrix.
     * @param {Float32Array} modelMatrix - Model matrix.
     */
    draw(mvpMatrix, mvMatrix, normalMatrix, modelMatrix) {
        gl.useProgram(this.program);

        // Bind texture and set uniforms
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.uniformMatrix4fv(this.uniforms.mvp, false, mvpMatrix);
        gl.uniformMatrix4fv(this.uniforms.mv, false, mvMatrix);
        gl.uniformMatrix4fv(this.uniforms.normalMV, false, normalMatrix);
        gl.uniformMatrix4fv(this.uniforms.modelMatrix, false, modelMatrix);
        gl.uniform1i(this.uniforms.isLightSource, this.isLightSource);

        // Enable vertex attributes
        this.#enableAttribute(this.attributes.position, this.buffers.position, 3);
        this.#enableAttribute(this.attributes.normal, this.buffers.normal, 3);
        this.#enableAttribute(this.attributes.texCoord, this.buffers.texCoord, 2);

        // Draw the triangles
        gl.drawArrays(gl.TRIANGLES, 0, this.numTriangles);
    }

    /**
     * Sets the texture from an image element.
     * @param {HTMLImageElement} img - The image to use as texture.
     */
    setTexture(img) {
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);

        // Configure texture parameters
        if (isPowerOf2(img.width) && isPowerOf2(img.height)) {
            gl.generateMipmap(gl.TEXTURE_2D);
        } else {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        }

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.uniform1i(this.uniforms.textureSampler, 0);
    }

    /**
     * Uploads data to a WebGL buffer.
     * @private
     * @param {WebGLBuffer} buffer - The buffer to upload data to.
     * @param {Float32Array} data - The data to upload.
     */
    #uploadBuffer(buffer, data) {
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
    }

    /**
     * Enables a vertex attribute.
     * @private
     * @param {GLint} location - The attribute location.
     * @param {WebGLBuffer} buffer - The buffer containing attribute data.
     * @param {number} size - The number of components per attribute.
     */
    #enableAttribute(location, buffer, size) {
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(location);
    }
}
