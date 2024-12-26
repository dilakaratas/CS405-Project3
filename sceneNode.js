/**
 * @class SceneNode
 * @desc A SceneNode is a node in the scene graph, responsible for rendering and propagating transformations.
 * @property {MeshDrawer} meshDrawer - The MeshDrawer object for rendering.
 * @property {TRS} trs - The TRS object for applying transformations.
 * @property {SceneNode} parent - The parent node in the graph.
 * @property {Array<SceneNode>} children - The list of child nodes.
 */
class SceneNode {
    constructor(meshDrawer, trs, parent = null) {
        this.meshDrawer = meshDrawer || null; // Optional MeshDrawer for rendering
        this.trs = trs; // Transformation object
        this.parent = parent; // Parent node
        this.children = []; // List of children nodes

        // Automatically register this node as a child of its parent
        if (this.parent) {
            this.parent.addChild(this);
        }
    }

    /**
     * Adds a child node to this node.
     * @param {SceneNode} node - The child node to add.
     */
    addChild(node) {
        this.children.push(node);
    }

    /**
     * Renders this node and its children, propagating transformations down the hierarchy.
     * @param {mat4} mvpMatrix - The Model-View-Projection matrix.
     * @param {mat4} modelViewMatrix - The Model-View matrix.
     * @param {mat4} normalMatrix - The Normal transformation matrix.
     * @param {mat4} modelMatrix - The Model matrix.
     */
    draw(mvpMatrix, modelViewMatrix, normalMatrix, modelMatrix) {
        // Compute the transformation matrix for this node
        const nodeTransform = this.trs.getTransformationMatrix();

        // Update the matrices by combining with the current node's transformation
        const updatedMVP = MatrixMult(mvpMatrix, nodeTransform);
        const updatedModelView = MatrixMult(modelViewMatrix, nodeTransform);
        const updatedNormal = MatrixMult(normalMatrix, nodeTransform);
        const updatedModel = MatrixMult(modelMatrix, nodeTransform);

        // Render this node's mesh, if present
        if (this.meshDrawer) {
            this.meshDrawer.draw(updatedMVP, updatedModelView, updatedNormal, updatedModel);
        }

        // Recursively draw all child nodes
        for (const child of this.children) {
            child.draw(updatedMVP, updatedModelView, updatedNormal, updatedModel);
        }
    }
}
