import { wireEscapeButton } from "./escape-button.js";

const playground = document.getElementById("playground");
const likeButton = document.getElementById("likeButton");
const dislikeButton = document.getElementById("dislikeButton");
const message = document.getElementById("message");

if (!(playground instanceof HTMLElement) ||
		!(likeButton instanceof HTMLButtonElement) ||
		!(dislikeButton instanceof HTMLButtonElement)) {
	throw new Error("Required game elements are missing.");
}

wireEscapeButton(
	playground,
	dislikeButton,
	message instanceof HTMLElement ? message : null
);

const HEART_EMOJIS = ["💖", "💗", "💘", "💕", "❤️", "🩷"];
const FANFARE_EMOJIS = ["🎉", "🎊", "🥳", "✨", "🎺", "🎇"];

function createHeartRain(target) {
	const burstCount = 28;

	for (let index = 0; index < burstCount; index += 1) {
		const heart = document.createElement("span");
		heart.className = "heart-drop";
		heart.textContent = HEART_EMOJIS[index % HEART_EMOJIS.length];

		const left = Math.random() * 100;
		const delay = Math.random() * 280;
		const duration = 1200 + Math.random() * 1000;
		const drift = -24 + Math.random() * 48;
		const size = 18 + Math.random() * 18;

		heart.style.left = `${left}%`;
		heart.style.fontSize = `${size}px`;
		heart.style.setProperty("--heart-delay", `${delay}ms`);
		heart.style.setProperty("--heart-duration", `${duration}ms`);
		heart.style.setProperty("--heart-drift", `${drift}px`);

		target.appendChild(heart);

		window.setTimeout(() => {
			heart.remove();
		}, delay + duration + 80);
	}
}

function createFanfareRain(target) {
	const burstCount = 34;

	for (let index = 0; index < burstCount; index += 1) {
		const fanfare = document.createElement("span");
		fanfare.className = "fanfare-drop";
		fanfare.textContent = FANFARE_EMOJIS[index % FANFARE_EMOJIS.length];

		const left = Math.random() * 100;
		const delay = Math.random() * 380;
		const duration = 1400 + Math.random() * 1100;
		const drift = -34 + Math.random() * 68;
		const size = 18 + Math.random() * 20;

		fanfare.style.left = `${left}%`;
		fanfare.style.fontSize = `${size}px`;
		fanfare.style.setProperty("--fanfare-delay", `${delay}ms`);
		fanfare.style.setProperty("--fanfare-duration", `${duration}ms`);
		fanfare.style.setProperty("--fanfare-drift", `${drift}px`);

		target.appendChild(fanfare);

		window.setTimeout(() => {
			fanfare.remove();
		}, delay + duration + 120);
	}
}

likeButton.addEventListener("click", () => {
	createHeartRain(playground);

	if (message instanceof HTMLElement) {
		message.textContent = "좋아! 편의점에서 만나~";
	}
});

let lastDislikeCelebrationAt = 0;

function triggerDislikeCelebration() {
	const now = Date.now();
	if (now - lastDislikeCelebrationAt < 220) {
		return;
	}
	lastDislikeCelebrationAt = now;

	createFanfareRain(playground);

	if (message instanceof HTMLElement) {
		message.textContent = "축하합니다! 이걸 누르네?";
	}
}

// Escape button moves on hover/down, so fire celebration on press as well.
dislikeButton.addEventListener("pointerdown", triggerDislikeCelebration);
dislikeButton.addEventListener("click", triggerDislikeCelebration);

playground.addEventListener(
	"pointerdown",
	(event) => {
		if (!(event.target instanceof Element)) {
			return;
		}

		if (event.target.closest("#likeButton")) {
			return;
		}

		const dislikeRect = dislikeButton.getBoundingClientRect();
		const centerX = dislikeRect.left + dislikeRect.width / 2;
		const centerY = dislikeRect.top + dislikeRect.height / 2;
		const distance = Math.hypot(event.clientX - centerX, event.clientY - centerY);

		// Allow users to see the effect even when the escape logic makes direct click too hard.
		if (distance <= 190) {
			triggerDislikeCelebration();
		}
	},
	true
);
