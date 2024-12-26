/**
 * @class SceneNode
 * @desc A SceneNode is a node in the scene graph.
 * @property {MeshDrawer} meshDrawer - The MeshDrawer object to draw
 * @property {TRS} trs - The TRS object to transform the MeshDrawer
 * @property {SceneNode} parent - The parent node
 * @property {Array} children - The children nodes
 */

class SceneNode {
    constructor(meshDrawer, trs, parent = null) {
        this.meshDrawer = meshDrawer;
        this.trs = trs;
        this.parent = parent;
        this.children = [];

        // Automatically add this node as a child to its parent, if a parent exists
        parent?.addChild(this);
    }

    addChild(node) {
        this.children.push(node);
    }

    draw(mvp, modelView, normalMatrix, modelMatrix) {
        /**
         * @Task1 : Implement the draw function for the SceneNode class.
         */

        const transformationMatrix = this.trs.getTransformationMatrix();

        // Compute transformed matrices
        const transformedMvp = MatrixMult(mvp, transformationMatrix);
        const transformedNormals = MatrixMult(normalMatrix, transformationMatrix);
        const transformedModelView = MatrixMult(modelView, transformationMatrix);
        const transformedModel = MatrixMult(modelMatrix, transformationMatrix);

        // Recursively draw all children
        this.children.forEach(child => 
            child.draw(transformedMvp, transformedModelView, transformedNormals, transformedModel)
        );

        // Draw the mesh if it exists
        this.meshDrawer?.draw(transformedMvp, transformedModelView, transformedNormals, transformedModel);
    }
}
