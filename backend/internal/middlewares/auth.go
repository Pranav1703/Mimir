package middlewares
import (
	"context"
	"encoding/json"
	"net/http"
	"mimir/internal/utils"
)

type contextKey string

const UserCtxKey contextKey = "user"

func VerifyToken(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		cookie, err := r.Cookie("access_token")
		if err != nil {
			w.WriteHeader(http.StatusUnauthorized)
			json.NewEncoder(w).Encode(map[string]string{"error": "unauthorized"})
			return
		}
		claims, err := utils.ValidateToken(cookie.Value)
		if err != nil {
			w.WriteHeader(http.StatusUnauthorized)
			json.NewEncoder(w).Encode(map[string]string{"error": "invalid or expired token"})
			return
		}
		ctx := context.WithValue(r.Context(), UserCtxKey, claims)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func UserFromContext(ctx context.Context) *utils.Claims {
	claims, _ := ctx.Value(UserCtxKey).(*utils.Claims)
	return claims
}