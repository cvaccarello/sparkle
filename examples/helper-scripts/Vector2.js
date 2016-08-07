class Vector2 {
    constructor(x,y) {
		this.x = x;
		this.y = y;
	}

	add(v) {
		return new Vector2(this.x + v.x, this.y + v.y);
	}

	sub(v) {
		return new Vector2(this.x - v.x, this.y - v.y);
	}

	mul(num) {
		return new Vector2(this.x * num, this.y * num);
	}

	length() {
		return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
	}

	copy() {
		return new Vector2(this.x, this.y);
	}

	normalize(length) {
		var length = (length)? length: this.length();
		this.x /= length;
		this.y /= length;
		return this;
	}

	normalizeCopy(length) {
		var length = (length)? length: this.length();
		return new Vector2(this.x / length, this.y / length);
	}

	perpendicularVector() {
		return new Vector2(-this.y, this.x);
	}
}
