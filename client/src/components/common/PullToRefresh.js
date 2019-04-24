let settings = {
	distThreshold: 60,
	distMax: 80,
	distReload: 50,
	bodyOffset: 20,
	triggerElement: 'body',
	ptrElement: '.ptr',
	classPrefix: 'pull-',
	cssProp: 'height',
	containerClassName: '',
	boxClassName: '',
	contentClassName: '',
	textClassName: '',
	refreshTimeout: 500,
	onInit: () => {
	},
	onRefresh: () => window.location.reload(),
	resistanceFunction: t => Math.min(1, t / 2.5),
	ptrOnDesktop: false,
};

let pullStartY = null;
let pullMoveY = null;
let dist = 0;
let distResisted = 0;

let _state = 'pending';
let _setup = false;
let _enable = false;
let _timeout;

function _setupEvents() {
	const {ptrOnDesktop} = settings;


	function onReset() {
		_state = 'pending';
	}

	function _onTouchStart(e) {
		const {triggerElement} = settings;

		const screenY = e.touches ? e.touches[0].screenY : e.screenY;

		if (ptrOnDesktop) {
			window.addEventListener('mousemove', _onTouchMove, {passive: false});
		}

		if (!window.scrollY) {
			pullStartY = screenY;
		}

		if (_state !== 'pending') {
			return;
		}

		clearTimeout(_timeout);

		_enable = triggerElement.contains(e.target);
		_state = 'pending';
	}

	function _onTouchMove(e) {
		const {
			ptrElement, resistanceFunction, distMax, distThreshold, cssProp, classPrefix,iconElement
		} = settings;

		const screenY = e.touches ? e.touches[0].screenY : e.screenY;

		if (!pullStartY) {
			if (!window.scrollY) {
				pullStartY = screenY;
			}
		} else {
			pullMoveY = screenY;
		}

		if (!_enable || _state === 'refreshing') {
			if (!window.scrollY && pullStartY < pullMoveY) {
				e.preventDefault();
			}

			return;
		}

		if (e.target.classList.contains('ripple-effect')) return;

		if (_state === 'pending') {
			ptrElement.classList.add(`${classPrefix}pull`);
			_state = 'pulling';
		}

		if (pullStartY && pullMoveY) {
			dist = pullMoveY - pullStartY;
		}

		if (dist > 0) {
			//e.preventDefault();

			ptrElement.style[cssProp] = `${distResisted}px`;
			iconElement.style.opacity = `${distResisted / 80}`;

			distResisted = resistanceFunction(dist / distThreshold) * Math.min(distMax, dist);

			if (_state === 'pulling' && distResisted > distThreshold) {
				ptrElement.classList.add(`${classPrefix}release`);
				_state = 'releasing';
			}

			if (_state === 'releasing' && distResisted < distThreshold) {
				ptrElement.classList.remove(`${classPrefix}release`);
				_state = 'pulling';
			}
		}
	}

	function _onTouchEnd() {
		const {
			ptrElement, onRefresh, refreshTimeout, distThreshold, distReload, cssProp, classPrefix, iconElement
		} = settings;

		if (_state === 'releasing' && distResisted > distThreshold) {
			_state = 'refreshing';

			ptrElement.style[cssProp] = `${distReload}px`;
			iconElement.style.opacity = `${distResisted / 80}`;
			ptrElement.classList.add(`${classPrefix}refresh`);

			_timeout = setTimeout(() => {
				const retval = onRefresh(onReset);

				if (retval && typeof retval.then === 'function') {
					retval.then(() => onReset());
				}

				if (!retval && !onRefresh.length) {
					onReset();
				}
			}, refreshTimeout);
		} else {
			if (_state === 'refreshing') {
				return;
			}

			iconElement.style.opacity = '0';
			ptrElement.style[cssProp] = '0px';

			_state = 'pending';
		}


		ptrElement.classList.remove(`${classPrefix}release`);
		ptrElement.classList.remove(`${classPrefix}pull`);

		pullStartY = null;
		pullMoveY = null;
		dist = 0;
		distResisted = 0;

		if (ptrOnDesktop) {
			window.removeEventListener('mousemove', _onTouchMove);
		}
	}

	window.addEventListener('touchend', _onTouchEnd);
	window.addEventListener('touchstart', _onTouchStart);
	window.addEventListener('touchmove', _onTouchMove, {passive: false});

	if (ptrOnDesktop) {
		window.addEventListener('mouseup', _onTouchEnd);
		window.addEventListener('mousedown', _onTouchStart);
		window.addEventListener('mousemove', _onTouchMove, {passive: false});
	}

	// Store event handlers to use for teardown later
	return {
		onTouchStart: _onTouchStart,
		onTouchMove: _onTouchMove,
		onTouchEnd: _onTouchEnd,
	};
}

function _run() {
	const {onInit} = settings;

	if (!settings.ptrElement) {
		const ptr = document.createElement('div');
		ptr.className = "pull-container";
		ptr.innerHTML = "<span class='icon'/>";
		document.body.insertBefore(ptr, document.body.firstChild);
		settings.ptrElement = ptr;
	}

	if (typeof onInit === 'function') {
		onInit(settings);
	}

	return {
		ptrElement: settings.ptrElement
	};
}

const PullToRefresh = {
	init() {
		let handlers;

		if (typeof settings.ptrElement === 'string') {
			settings.ptrElement = document.querySelector(settings.ptrElement);
		}

		if (typeof settings.triggerElement === 'string') {
			settings.triggerElement = document.querySelector(settings.triggerElement);
		}

		let {ptrElement} = _run();

		settings.iconElement = settings.ptrElement.querySelector('.icon');

		if (!_setup) {
			handlers = _setupEvents();
			_setup = true;
		}

		return {
			destroy() {
				// Teardown event listeners
				window.removeEventListener('touchstart', handlers.onTouchStart);
				window.removeEventListener('touchend', handlers.onTouchEnd);
				window.removeEventListener('touchmove', handlers.onTouchMove);

				if (settings.ptrOnDesktop) {
					window.removeEventListener('mouseup', handlers.onTouchEnd);
					window.removeEventListener('mousedown', handlers.onTouchStart);
					window.removeEventListener('mousemove', handlers.onTouchMove);
				}

				// Remove ptr element and style tag
				//styleNode.parentNode.removeChild(styleNode);
				ptrElement.parentNode.removeChild(ptrElement);

				// Enable setupEvents to run again
				_setup = false;

				// null object references
				handlers = null;
				//styleNode = null;
				ptrElement = null;
				settings = {};
			},
		};
	},
};

module.exports = PullToRefresh;
