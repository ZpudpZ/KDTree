// Implementación de KD-Tree para búsqueda de vecino más cercano en 2D

class KDTree {
    constructor(points) {
        this.root = this.build(points, 0);
    }

    build(points, depth) {
        if (points.length === 0) return null;

        const axis = depth % 2;

        points.sort((a, b) => a[axis] - b[axis]);

        const median = Math.floor(points.length / 2);
        const node = {
            point: points[median],
            left: this.build(points.slice(0, median), depth + 1),
            right: this.build(points.slice(median + 1), depth + 1)
        };

        return node;
    }

    insert(newPoint) {
        const insertRecursive = (node, depth) => {
            if (node === null) {
                return {
                    point: newPoint,
                    left: null,
                    right: null
                };
            }

            const axis = depth % 2;

            if (newPoint[axis] < node.point[axis]) {
                node.left = insertRecursive(node.left, depth + 1);
            } else {
                node.right = insertRecursive(node.right, depth + 1);
            }

            return node;
        };

        this.root = insertRecursive(this.root, 0);
    }

    findNearest(target) {
        let best = null;
        let bestDist = Infinity;

        const search = (node, depth = 0) => {
            if (node === null) return;

            const axis = depth % 2;
            const point = node.point;
            const distance = this.distance(point, target);

            if (distance < bestDist) {
                best = point;
                bestDist = distance;
            }

            if (target[axis] < point[axis]) {
                search(node.left, depth + 1);
                if (Math.abs(target[axis] - point[axis]) < bestDist) {
                    search(node.right, depth + 1);
                }
            } else {
                search(node.right, depth + 1);
                if (Math.abs(target[axis] - point[axis]) < bestDist) {
                    search(node.left, depth + 1);
                }
            }
        };

        search(this.root);

        return best;
    }

    distance(point1, point2) {
        return Math.sqrt((point1[0] - point2[0]) ** 2 + (point1[1] - point2[1]) ** 2);
    }
}
