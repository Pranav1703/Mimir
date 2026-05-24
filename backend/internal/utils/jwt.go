package utils

import (
	"errors"
	"time"
	"github.com/golang-jwt/jwt/v5"
)
var jwtSecret []byte = []byte(GetEnv("JWT_SECRET"))

type Claims struct {
	Id string 		`jso:"id"`
	Username string `json:"username"`
	jwt.RegisteredClaims
}

func GenerateToken(userID, username string) (string, error) {
	claims := &Claims{
		Id: userID,
		Username: username,
		RegisteredClaims: jwt.RegisteredClaims{
			Subject: userID,
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(7 * 24 * time.Hour)),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256,claims)
	return token.SignedString(jwtSecret)
}

func ValidateToken(tokenString string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (any, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return jwtSecret, nil
	})
	if err != nil {
		return nil, err
	}
	claims, ok := token.Claims.(*Claims)
	if !ok || !token.Valid {
		return nil, errors.New("invalid token")
	}
	return claims, nil
}