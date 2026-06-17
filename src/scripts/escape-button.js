function clamp(value, min, max) {
	return Math.max(min, Math.min(max, value));
}

export function wireEscapeButton(playground, dislikeButton, messageNode) {
	void messageNode;

	const DANGER_RADIUS = 250;
	const PANIC_RADIUS = 150;
	const EDGE_PADDING = 12;
	const NORMAL_STEP = 310;
	const PANIC_STEP = 460;
	const JITTER_RANGE = 90;
	const SMOOTHING = 0.22;

	let currentLeft = dislikeButton.offsetLeft;
	let currentTop = dislikeButton.offsetTop;
	let targetLeft = currentLeft;
	let targetTop = currentTop;
	let rafId = null;

	function getBounds() {
		const maxX = Math.max(EDGE_PADDING, playground.clientWidth - dislikeButton.offsetWidth - EDGE_PADDING);

		let minY = EDGE_PADDING;
		const overlayNode = playground.parentElement?.querySelector(".overlay");
		if (overlayNode instanceof HTMLElement) {
			const playgroundRect = playground.getBoundingClientRect();
			const overlayRect = overlayNode.getBoundingClientRect();
			const overlayBottomInPlayground = overlayRect.bottom - playgroundRect.top;
			minY = Math.max(minY, Math.ceil(overlayBottomInPlayground) + EDGE_PADDING);
		}

		const maxY = Math.max(minY, playground.clientHeight - dislikeButton.offsetHeight - EDGE_PADDING);

		return {
			minX: EDGE_PADDING,
			minY,
			maxX,
			maxY,
			btnWidth: dislikeButton.offsetWidth,
			btnHeight: dislikeButton.offsetHeight
		};
	}

	function placeNow(left, top) {
		const bounds = getBounds();
		currentLeft = clamp(left, bounds.minX, bounds.maxX);
		currentTop = clamp(top, bounds.minY, bounds.maxY);
		targetLeft = currentLeft;
		targetTop = currentTop;
		dislikeButton.style.left = `${currentLeft}px`;
		dislikeButton.style.top = `${currentTop}px`;
	}

	function animateToTarget() {
		const dx = targetLeft - currentLeft;
		const dy = targetTop - currentTop;
		const distance = Math.hypot(dx, dy);

		if (distance < 0.8) {
			currentLeft = targetLeft;
			currentTop = targetTop;
			dislikeButton.style.left = `${currentLeft}px`;
			dislikeButton.style.top = `${currentTop}px`;
			rafId = null;
			return;
		}

		currentLeft += dx * SMOOTHING;
		currentTop += dy * SMOOTHING;
		dislikeButton.style.left = `${currentLeft}px`;
		dislikeButton.style.top = `${currentTop}px`;

		rafId = window.requestAnimationFrame(animateToTarget);
	}

	function moveTarget(left, top) {
		const bounds = getBounds();
		targetLeft = clamp(left, bounds.minX, bounds.maxX);
		targetTop = clamp(top, bounds.minY, bounds.maxY);

		if (rafId === null) {
			rafId = window.requestAnimationFrame(animateToTarget);
		}
	}

	function farCorner(localX, localY) {
		const bounds = getBounds();
		const corners = [
			{ left: bounds.minX, top: bounds.minY },
			{ left: bounds.maxX, top: bounds.minY },
			{ left: bounds.minX, top: bounds.maxY },
			{ left: bounds.maxX, top: bounds.maxY }
		];

		let best = corners[0];
		let bestDistance = -1;

		for (const corner of corners) {
			const cx = corner.left + bounds.btnWidth / 2;
			const cy = corner.top + bounds.btnHeight / 2;
			const distance = Math.hypot(localX - cx, localY - cy);
			if (distance > bestDistance) {
				best = corner;
				bestDistance = distance;
			}
		}

		return best;
	}

	function jumpAway(pointerX, pointerY, isPanic = false) {
		const bounds = getBounds();
		const areaRect = playground.getBoundingClientRect();
		const localX = pointerX - areaRect.left;
		const localY = pointerY - areaRect.top;

		if (!Number.isFinite(localX) || !Number.isFinite(localY)) {
			moveTarget(
				Math.random() * (bounds.maxX - bounds.minX) + bounds.minX,
				Math.random() * (bounds.maxY - bounds.minY) + bounds.minY
			);
			return;
		}

		const centerX = currentLeft + bounds.btnWidth / 2;
		const centerY = currentTop + bounds.btnHeight / 2;
		let vx = centerX - localX;
		let vy = centerY - localY;
		let length = Math.hypot(vx, vy);

		if (length < 0.001) {
			vx = Math.random() > 0.5 ? 1 : -1;
			vy = Math.random() > 0.5 ? 1 : -1;
			length = Math.hypot(vx, vy);
		}

		const step = isPanic ? PANIC_STEP : NORMAL_STEP;
		const jitterX = (Math.random() - 0.5) * JITTER_RANGE;
		const jitterY = (Math.random() - 0.5) * JITTER_RANGE;

		let nextLeft = currentLeft + (vx / length) * step + jitterX;
		let nextTop = currentTop + (vy / length) * step + jitterY;

		nextLeft = clamp(nextLeft, bounds.minX, bounds.maxX);
		nextTop = clamp(nextTop, bounds.minY, bounds.maxY);

		const nextCenterX = nextLeft + bounds.btnWidth / 2;
		const nextCenterY = nextTop + bounds.btnHeight / 2;
		const nextDistance = Math.hypot(localX - nextCenterX, localY - nextCenterY);

		if (nextDistance < DANGER_RADIUS) {
			const corner = farCorner(localX, localY);
			nextLeft = corner.left;
			nextTop = corner.top;
		}

		moveTarget(nextLeft, nextTop);
	}

	function blockClickAttempt(event) {
		event.preventDefault();
		event.stopImmediatePropagation();
		jumpAway(event.clientX, event.clientY, true);
	}

	function onPointerMove(event) {
		const bounds = getBounds();
		const centerX = currentLeft + bounds.btnWidth / 2;
		const centerY = currentTop + bounds.btnHeight / 2;
		const localX = event.clientX - playground.getBoundingClientRect().left;
		const localY = event.clientY - playground.getBoundingClientRect().top;
		const distance = Math.hypot(localX - centerX, localY - centerY);

		if (distance < DANGER_RADIUS) {
			jumpAway(event.clientX, event.clientY, distance < PANIC_RADIUS);
		}
	}

	playground.addEventListener("mousemove", onPointerMove);
	playground.addEventListener("pointermove", onPointerMove);

	dislikeButton.addEventListener("mouseenter", (event) => {
		jumpAway(event.clientX, event.clientY, true);
	});

	dislikeButton.addEventListener("pointerdown", (event) => {
		jumpAway(event.clientX, event.clientY, true);
	});

	dislikeButton.addEventListener("pointerdown", blockClickAttempt, true);
	dislikeButton.addEventListener("mousedown", blockClickAttempt, true);
	dislikeButton.addEventListener("click", blockClickAttempt, true);
	dislikeButton.addEventListener("touchstart", blockClickAttempt, { capture: true, passive: false });

	dislikeButton.addEventListener("focus", () => {
		dislikeButton.blur();
		jumpAway(Number.NaN, Number.NaN, true);
	});

	dislikeButton.addEventListener("keydown", (event) => {
		if (event.key === "Enter" || event.key === " ") {
			event.preventDefault();
			event.stopPropagation();
			jumpAway(Number.NaN, Number.NaN, true);
		}
	});

	window.addEventListener("resize", () => {
		placeNow(currentLeft, currentTop);
		jumpAway(Number.NaN, Number.NaN, true);
	});

	placeNow(dislikeButton.offsetLeft, dislikeButton.offsetTop);
}
