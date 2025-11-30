import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { ScrollArea } from './ui/scroll-area';
import { useApp } from '../context/AppContext';
import { toast } from 'sonner@2.0.3';
import { Pencil, Trash2, Check, X } from 'lucide-react';
import { Comment } from '../types';

interface CommentsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  analysisId: string;
  analysisUrl: string;
}

export function CommentsModal({ open, onOpenChange, analysisId, analysisUrl }: CommentsModalProps) {
  const { comments, currentUser, addComment, editComment, deleteComment, canEditComment } = useApp();
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');

  const analysisComments = comments.filter((c) => c.analysisId === analysisId);

  const handleAddComment = () => {
    if (!newComment.trim()) {
      toast.error('El comentario no puede estar vacío');
      return;
    }

    addComment(analysisId, newComment);
    setNewComment('');
    toast.success('Comentario agregado');
  };

  const handleStartEdit = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditingContent(comment.contenido);
  };

  const handleSaveEdit = () => {
    if (!editingContent.trim()) {
      toast.error('El comentario no puede estar vacío');
      return;
    }

    if (editingCommentId) {
      editComment(editingCommentId, editingContent);
      setEditingCommentId(null);
      setEditingContent('');
      toast.success('Comentario actualizado');
    }
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditingContent('');
  };

  const handleDelete = (commentId: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este comentario?')) {
      deleteComment(commentId);
      toast.success('Comentario eliminado');
    }
  };

  const formatDate = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTimeRemaining = (comment: Comment): string | null => {
    if (currentUser?.rol === 'Supervisor' && comment.userId === currentUser.id) {
      return null;
    }

    if (comment.userId === currentUser?.id) {
      const now = new Date();
      const commentTime = new Date(comment.fechaCreacion);
      const diffMinutes = (now.getTime() - commentTime.getTime()) / (1000 * 60);
      const remaining = 3 - diffMinutes;
      
      if (remaining > 0) {
        return `${Math.ceil(remaining)} min para editar`;
      }
    }
    return null;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Comentarios del Análisis</DialogTitle>
          <DialogDescription>
            URL: {analysisUrl}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            {analysisComments.length === 0 ? (
              <p className="text-center text-slate-500 py-8">No hay comentarios aún</p>
            ) : (
              analysisComments.map((comment) => {
                const isEditing = editingCommentId === comment.id;
                const canEdit = canEditComment(comment);
                const timeRemaining = getTimeRemaining(comment);

                return (
                  <div key={comment.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm">{comment.userName}</p>
                        <p className="text-xs text-slate-500">
                          {formatDate(comment.fechaCreacion)}
                          {comment.fechaEdicion && ' (editado)'}
                        </p>
                        {timeRemaining && (
                          <p className="text-xs text-amber-600">{timeRemaining}</p>
                        )}
                      </div>
                      {comment.userId === currentUser?.id && (
                        <div className="flex gap-2">
                          {canEdit && !isEditing && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleStartEdit(comment)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(comment.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                    {isEditing ? (
                      <div className="space-y-2">
                        <Textarea
                          value={editingContent}
                          onChange={(e) => setEditingContent(e.target.value)}
                          rows={3}
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={handleSaveEdit}>
                            <Check className="h-4 w-4 mr-1" />
                            Guardar
                          </Button>
                          <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                            <X className="h-4 w-4 mr-1" />
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm">{comment.contenido}</p>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>

        <div className="space-y-2 pt-4 border-t">
          <Textarea
            placeholder="Escribe un comentario..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={3}
          />
          <Button onClick={handleAddComment} className="w-full">
            Agregar Comentario
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
