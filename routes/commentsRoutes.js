const express = require("express");
const commentsController = require("../controllers/commentsController");

const router = express.Router();

// Rutas de comentarios
router.get("/public", commentsController.getPublicComments);
router.get("/:id/comments", commentsController.getImageComments);
router.post("/:id/comments", commentsController.addCommentToImage);
router.delete("/:id/comments/:commentId", commentsController.removeCommentFromImage);
router.put("/accept/:commentId", commentsController.acceptComment);
router.put("/remove/:commentId", commentsController.removeCommentFromImage);
router.get("/comments/pending", commentsController.getPublicComments);

module.exports = router;