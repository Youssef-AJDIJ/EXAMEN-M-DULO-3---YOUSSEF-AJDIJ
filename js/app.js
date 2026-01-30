import { QuizApp } from './quiz.js';

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    const app = new QuizApp();

    // Exponer la instancia globalmente para debugging (opcional)
    window.quizApp = app;
});
