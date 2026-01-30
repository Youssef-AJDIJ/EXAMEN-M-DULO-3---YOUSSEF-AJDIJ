import { quizData } from './data.js';

/**
 * Clase QuizApp - Gestiona toda la lógica del quiz
 */
export class QuizApp {
    constructor() {
        // Variables de estado
        this.currentQuestions = [];
        this.currentIndex = 0;
        this.score = 0;
        this.incorrectCount = 0;
        this.userAnswers = [];

        // Elementos del DOM
        this.homeScreen = document.getElementById('home-screen');
        this.quizScreen = document.getElementById('quiz-screen');
        this.resultScreen = document.getElementById('result-screen');
        this.topicSelect = document.getElementById('topic-select');
        this.optionsContainer = document.getElementById('options-container');
        this.nextBtn = document.getElementById('next-btn');
        this.emojiContainer = document.getElementById('emoji-container');

        // Emojis para efectos
        this.clapEmojis = ['👏', '🎉', '🥳', '🎊', '✨', '⭐', '🌟', '💫', '🏆', '🎯'];
        this.cryEmojis = ['😢', '😭', '💧', '🥺', '😿', '💔'];

        // Inicializar
        this.init();
    }

    /**
     * Inicializa la aplicación
     */
    init() {
        this.populateTopics();
        this.bindEvents();
    }

    /**
     * Llena el select con los temas disponibles
     */
    populateTopics() {
        Object.keys(quizData).forEach(tema => {
            const option = document.createElement('option');
            option.value = tema;
            option.textContent = tema;
            this.topicSelect.appendChild(option);
        });
    }

    /**
     * Bindea todos los eventos
     */
    bindEvents() {
        // Botón iniciar
        document.getElementById('start-btn').addEventListener('click', () => this.startGame());

        // Botón siguiente
        this.nextBtn.addEventListener('click', () => this.nextQuestion());

        // Toggle resumen
        document.getElementById('toggle-review-btn').addEventListener('click', () => this.toggleReview());

        // Reiniciar
        document.getElementById('restart-btn').addEventListener('click', () => this.restart());
    }

    /**
     * Inicia el juego
     */
    startGame() {
        const name = document.getElementById('user-name').value.trim();
        const topic = this.topicSelect.value;

        if (!name || !topic) {
            alert("Por favor, llena todos los campos");
            return;
        }

        localStorage.setItem('usuario', name);
        this.currentQuestions = quizData[topic];

        // Reiniciar contadores
        this.currentIndex = 0;
        this.score = 0;
        this.incorrectCount = 0;
        this.userAnswers = [];

        this.homeScreen.classList.add('hidden');
        this.quizScreen.classList.remove('hidden');
        document.getElementById('current-user').textContent = `👤 ${name}`;

        this.showQuestion();
    }

    /**
     * Muestra la pregunta actual
     */
    showQuestion() {
        const q = this.currentQuestions[this.currentIndex];
        document.getElementById('question-text').textContent = q.pregunta;
        document.getElementById('progress-bar').textContent = `Pregunta ${this.currentIndex + 1} de ${this.currentQuestions.length}`;

        this.optionsContainer.innerHTML = '';
        this.nextBtn.classList.add('hidden');

        q.opciones.forEach((opcion, index) => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.textContent = opcion;
            btn.addEventListener('click', () => this.checkAnswer(index, btn));
            this.optionsContainer.appendChild(btn);
        });
    }

    /**
     * Valida la respuesta seleccionada
     */
    checkAnswer(selectedIndex, btn) {
        const q = this.currentQuestions[this.currentIndex];
        const buttons = this.optionsContainer.querySelectorAll('button');

        // Deshabilitar otros botones
        buttons.forEach(b => b.style.pointerEvents = 'none');

        const isCorrect = selectedIndex === q.correcta;

        this.userAnswers.push({
            pregunta: q.pregunta,
            opciones: q.opciones,
            respuestaUsuario: selectedIndex,
            respuestaCorrecta: q.correcta,
            esCorrecta: isCorrect
        });

        if (isCorrect) {
            btn.classList.add('correct');
            this.score++;
        } else {
            btn.classList.add('incorrect');
            buttons[q.correcta].classList.add('correct');
            this.incorrectCount++;
        }

        this.nextBtn.classList.remove('hidden');
    }

    /**
     * Pasa a la siguiente pregunta o muestra resultados
     */
    nextQuestion() {
        this.currentIndex++;
        if (this.currentIndex < this.currentQuestions.length) {
            this.showQuestion();
        } else {
            this.showResults();
        }
    }

    /**
     * Muestra la pantalla de resultados
     */
    showResults() {
        this.quizScreen.classList.add('hidden');
        this.resultScreen.classList.remove('hidden');

        const totalQuestions = this.currentQuestions.length;
        const percentage = Math.round((this.score / totalQuestions) * 100);
        const passed = this.score >= 5;

        // Mostrar nombre
        document.getElementById('final-name').textContent = localStorage.getItem('usuario');

        // Mostrar puntuación
        document.getElementById('score-number').textContent = this.score;
        document.getElementById('score-percentage').textContent = `${percentage}% de aciertos`;

        // Mostrar contadores
        document.getElementById('correct-count').textContent = this.score;
        document.getElementById('incorrect-count').textContent = this.incorrectCount;

        // Badge de aprobado/suspendido
        const statusBadge = document.getElementById('status-badge');
        if (passed) {
            statusBadge.textContent = '✅ APROBADO';
            statusBadge.className = 'status-badge passed';
        } else {
            statusBadge.textContent = '❌ SUSPENDIDO';
            statusBadge.className = 'status-badge failed';
        }

        // Mensaje personalizado según resultado
        const resultMessage = document.getElementById('result-message');
        if (this.score >= 8) {
            resultMessage.textContent = '🏆 ¡Excelente! Dominas el tema';
            resultMessage.className = 'result-message excellent';
        } else if (this.score >= 5) {
            resultMessage.textContent = '👍 ¡Bien hecho! Vas por buen camino';
            resultMessage.className = 'result-message good';
        } else {
            resultMessage.textContent = '📚 Necesitas repasar más';
            resultMessage.className = 'result-message needs-work';
        }

        // Efectos de emojis según resultado
        if (passed) {
            this.createClapEffect();
        } else {
            this.createCryEffect();
        }

        // Preparar resumen de respuestas
        this.prepareReview();
    }

    /**
     * Prepara el resumen de respuestas
     */
    prepareReview() {
        const reviewContainer = document.getElementById('review-container');
        reviewContainer.innerHTML = '';
        reviewContainer.classList.remove('show');

        // Reset del botón toggle
        const toggleBtn = document.getElementById('toggle-review-btn');
        toggleBtn.classList.remove('active');
        toggleBtn.innerHTML = '📝 Ver Resumen de Respuestas <span class="arrow">▼</span>';

        this.userAnswers.forEach((ans, index) => {
            const item = document.createElement('div');
            item.className = `review-item ${ans.esCorrecta ? 'review-correct' : 'review-incorrect'}`;

            item.innerHTML = `
                <p><strong>${index + 1}. ${ans.pregunta}</strong></p>
                <p style="color: ${ans.esCorrecta ? '#4caf50' : '#f44336'}">
                    Tu respuesta: ${ans.opciones[ans.respuestaUsuario]}
                </p>
                ${!ans.esCorrecta ? `<p style="color: #4caf50">✓ Correcta: ${ans.opciones[ans.respuestaCorrecta]}</p>` : ''}
            `;
            reviewContainer.appendChild(item);
        });
    }

    /**
     * Toggle para mostrar/ocultar resumen
     */
    toggleReview() {
        const reviewContainer = document.getElementById('review-container');
        const toggleBtn = document.getElementById('toggle-review-btn');

        reviewContainer.classList.toggle('show');
        toggleBtn.classList.toggle('active');

        if (reviewContainer.classList.contains('show')) {
            toggleBtn.innerHTML = '📝 Ocultar Resumen <span class="arrow">▲</span>';
        } else {
            toggleBtn.innerHTML = '📝 Ver Resumen de Respuestas <span class="arrow">▼</span>';
        }
    }

    /**
     * Reinicia el test
     */
    restart() {
        // Limpiar efectos
        this.emojiContainer.innerHTML = '';

        // Reiniciar estado
        this.currentQuestions = [];
        this.currentIndex = 0;
        this.score = 0;
        this.incorrectCount = 0;
        this.userAnswers = [];

        // Ocultar resumen
        document.getElementById('review-container').classList.remove('show');

        // Mostrar pantalla de inicio
        this.resultScreen.classList.add('hidden');
        this.homeScreen.classList.remove('hidden');

        // Limpiar campos
        document.getElementById('user-name').value = '';
        this.topicSelect.value = '';
    }

    /**
     * Crea efecto de aplausos (emojis flotando)
     */
    createClapEffect() {
        this.emojiContainer.innerHTML = '';

        for (let i = 0; i < 40; i++) {
            setTimeout(() => {
                const emoji = document.createElement('div');
                emoji.className = 'floating-emoji';
                emoji.textContent = this.clapEmojis[Math.floor(Math.random() * this.clapEmojis.length)];
                emoji.style.left = Math.random() * 100 + '%';
                emoji.style.animationDuration = (2.5 + Math.random() * 1.5) + 's';
                emoji.style.animationDelay = Math.random() * 0.3 + 's';
                emoji.style.fontSize = (1.8 + Math.random() * 1.5) + 'rem';
                this.emojiContainer.appendChild(emoji);

                setTimeout(() => emoji.remove(), 4000);
            }, i * 80);
        }
    }

    /**
     * Crea efecto de lágrimas (emojis cayendo)
     */
    createCryEffect() {
        this.emojiContainer.innerHTML = '';

        for (let i = 0; i < 30; i++) {
            setTimeout(() => {
                const emoji = document.createElement('div');
                emoji.className = 'falling-emoji';
                emoji.textContent = this.cryEmojis[Math.floor(Math.random() * this.cryEmojis.length)];
                emoji.style.left = Math.random() * 100 + '%';
                emoji.style.animationDuration = (3 + Math.random() * 2) + 's';
                emoji.style.animationDelay = Math.random() * 0.5 + 's';
                emoji.style.fontSize = (1.5 + Math.random() * 1) + 'rem';
                this.emojiContainer.appendChild(emoji);

                setTimeout(() => emoji.remove(), 5500);
            }, i * 120);
        }
    }
}