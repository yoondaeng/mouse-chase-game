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

likeButton.addEventListener("click", () => {
	createHeartRain(playground);

	if (message instanceof HTMLElement) {
		message.textContent = "좋아! 편의점에서 만나~";
	}
});
