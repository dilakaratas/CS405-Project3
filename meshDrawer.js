/**
 * @class MeshDrawer
 * @description Helper class for drawing meshes with support for lighting and textures.
 */
class MeshDrawer {
    constructor(isLightSource = false) {
        // Compile shader program
        this.prog = InitShaderProgram(meshVS, meshFS);

        // Attribute and uniform locations
        this.attribLocations = {
            position: gl.getAttribLocation(this.prog, 'position'),
            normal: gl.getAttribLocation(this.prog, 'normal'),
            texCoord: gl.getAttribLocation(this.prog, 'texCoord'),
        };

        this.uniformLocations = {
            mvp: gl.getUniformLocation(this.prog, 'mvp'),
            mv: gl.getUniformLocation(this.prog, 'mv'),
            normalMV: gl.getUniformLocation(this.prog, 'normalMV'),
            modelMatrix: gl.getUniformLocation(this.prog, 'modelMatrix'),
            isLightSource: gl.getUniformLocation(this.prog, 'isLightSource'),
            tex: gl.getUniformLocation(this.prog, 'tex'),
        };

        // Buffers for mesh data
        this.buffers = {
            position: gl.createBuffer(),
            normal: gl.createBuffer(),
            texCoord: gl.createBuffer(),
        };

        // Texture and settings
        this.texture = gl.createTexture();
        this.numTriangles = 0;
        this.isLightSource = isLightSource;
    }

    /**
     * Sets the mesh data for the drawer.
     * @param {Array} vertPos - Vertex positions
     * @param {Array} texCoords - Texture coordinates
     * @param {Array} normals - Vertex normals
     */
    setMesh(vertPos, texCoords, normals) {
        this.#bindAndBufferData(this.buffers.position, vertPos);
        this.#bindAndBufferData(this.buffers.normal, normals);
        this.#bindAndBufferData(this.buffers.texCoord, texCoords);

        this.numTriangles = vertPos.length / 3;
    }

    /**
     * Draws the mesh using the provided transformation matrices.
     */
    draw(matrixMVP, matrixMV, matrixNormal, modelMatrix) {
        gl.useProgram(this.prog);

        // Bind texture
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.uniformMatrix4fv(this.uniformLocations.mvp, false, matrixMVP);
        gl.uniformMatrix4fv(this.uniformLocations.mv, false, matrixMV);
        gl.uniformMatrix4fv(this.uniformLocations.normalMV, false, matrixNormal);
        gl.uniformMatrix4fv(this.uniformLocations.modelMatrix, false, modelMatrix);
        gl.uniform1i(this.uniformLocations.isLightSource, this.isLightSource);

        // Set vertex attributes
        this.#enableVertexAttrib(this.attribLocations.position, this.buffers.position, 3);
        this.#enableVertexAttrib(this.attribLocations.normal, this.buffers.normal, 3);
        this.#enableVertexAttrib(this.attribLocations.texCoord, this.buffers.texCoord, 2);

        // Draw triangles
        gl.drawArrays(gl.TRIANGLES, 0, this.numTriangles);
    }

    /**
     * Sets the texture from an HTML image element.
     */
    setTexture(img) {
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);

        if (isPowerOf2(img.width) && isPowerOf2(img.height)) {
            gl.generateMipmap(gl.TEXTURE_2D);
        } else {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        }

        gl.useProgram(this.prog);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.uniform1i(this.uniformLocations.tex, 0);
    }

    /**
     * Binds and buffers data for a given buffer.
     * @private
     */
    #bindAndBufferData(buffer, data) {
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
    }

    /**
     * Enables a vertex attribute for rendering.
     * @private
     */
    #enableVertexAttrib(location, buffer, size) {
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(location);
    }
}
