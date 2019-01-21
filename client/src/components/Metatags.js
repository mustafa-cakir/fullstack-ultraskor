import {Component} from 'react';

class Metatags extends Component {
	componentDidMount() {
		const {title, canonical, description, keywords, alternate, hrefLang} = this.props;
		const els = {
			//title: document.querySelectorAll('[data-meta="title"]'),
			canonical: document.querySelector('[data-meta="canonical"]'),
			description: document.querySelector('[data-meta="description"]'),
			keywords: document.querySelector('[data-meta="keywords"]'),
			alternate: document.querySelector('[data-meta="alternate"]'),

		};
		// metaEls.filter()
		if (title) document.title = title;
		if (canonical) els.canonical.setAttribute("href", canonical);
		if (description) els.description.setAttribute("content", description);
		if (keywords) els.keywords.setAttribute("content", keywords);
		if (alternate) els.alternate.setAttribute("href", alternate);
		if (hrefLang) els.alternate.setAttribute("hrefLang", hrefLang);

	}

	render() {
		return false;
	}
}

export default Metatags
