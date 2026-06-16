function clamp(value, min, max) {
	return Math.max(min, Math.min(max, value));
}

export function wireEscapeButton(playground, dislikeButton, messageNode) {
	function jumpAway(pointerX, pointerY) {
		const areaRect = playground.getBoundingClientRect();
		const btnRect = dislikeButton.getBoundingClientRect();

		const maxX = areaRect.width - btnRect.width;
		const maxY = areaRect.height - btnRect.height;

		const currentLeft = dislikeButton.offsetLeft;
		const currentTop = dislikeButton.offsetTop;

		const localX = pointerX - areaRect.left;
		const localY = pointerY - areaRect.top;

		let nextLeft = currentLeft + (currentLeft + btnRect.width / 2 < localX ? -120 : 120);
		let nextTop = currentTop + (currentTop + btnRect.height / 2 < localY ? -80 : 80);

		if (Number.isNaN(localX) || Number.isNaN(localY)) {
			nextLeft = Math.random() * maxX;
			nextTop = Math.random() * maxY;
		}

		dislikeButton.style.left = `${clamp(nextLeft, 8, Math.max(8, maxX - 8))}px`;
		dislikeButton.style.top = `${clamp(nextTop, 8, Math.max(8, maxY - 8))}px`;
	}

	playground.addEventListener("mousemove", (event) => {
		const btnRect = dislikeButton.getBoundingClientRect();
		const dx = event.clientX - (btnRect.left + btnRect.width / 2);
		const dy = event.clientY - (btnRect.top + btnRect.height / 2);
		const distance = Math.hypot(dx, dy);
		if (distance < 100) {
			jumpAway(event.clientX, event.clientY);
		}
	});

	dislikeButton.addEventListener("mouseenter", (event) => {
		jumpAway(event.clientX, event.clientY);
	});

	dislikeButton.addEventListener("pointerdown", (event) => {
		event.preventDefault();
		jumpAway(event.clientX, event.clientY);
	});

	dislikeButton.addEventListener("click", (event) => {
		event.preventDefault();
		jumpAway(Number.NaN, Number.NaN);
	});

	dislikeButton.addEventListener("keydown", (event) => {
		if (event.key === "Enter" || event.key === " ") {
			event.preventDefault();
			jumpAway(Number.NaN, Number.NaN);
		}
	});

	window.addEventListener("resize", () => {
		jumpAway(Number.NaN, Number.NaN);
	});
}
