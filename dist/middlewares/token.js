import jwt from "jsonwebtoken";
export const authMiddleware = (roles = []) => {
    return (req, res, next) => {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                error: "Access denied. No token provided.",
            });
        }
        const token = authHeader.split(" ")[1];
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            console.error("ERROR: JWT_SECRET is not defined.");
            return res.status(500).json({
                error: "Internal server error. Incomplete configuration.",
            });
        }
        try {
            const decoded = jwt.verify(token, jwtSecret);
            req.user = decoded;
            if (roles.length > 0 && !roles.includes(decoded.role)) {
                return res.status(403).json({
                    error: "Access forbidden. You do not have permission.",
                });
            }
            return next();
        }
        catch (error) {
            if (error?.name === "TokenExpiredError") {
                return res.status(401).json({
                    error: "Token expired.",
                });
            }
            return res.status(401).json({
                error: "Invalid token.",
            });
        }
    };
};
//# sourceMappingURL=token.js.map