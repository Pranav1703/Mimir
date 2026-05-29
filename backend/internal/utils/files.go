package utils

import (
	"bytes"
	"fmt"
	"io"

	"github.com/ledongthuc/pdf"
	"github.com/nguyenthenguyen/docx"
)

func ParseTextFile(file io.Reader) (string, error) {
	buf := new(bytes.Buffer)
	_, err := buf.ReadFrom(file)
	return buf.String(), err
}

func ParsePDFFile(file io.ReaderAt, size int64) (string, error) {
	reader, err := pdf.NewReader(file, size)
	if err != nil {
		return "", err
	}

	textReader, err := reader.GetPlainText()
	if err != nil {
		return "", err
	}

	buf := new(bytes.Buffer)
	_, err = buf.ReadFrom(textReader)
	return buf.String(), err
}

func ParseDocxFile(file io.Reader, size int64) (string, error) {
	buf := new(bytes.Buffer)
	_, err := buf.ReadFrom(file)
	if err != nil {
		return "", fmt.Errorf("failed to read docx: %w", err)
	}

	r := bytes.NewReader(buf.Bytes())
	replaceDocx, err := docx.ReadDocxFromMemory(r, size)
	if err != nil {
		return "", fmt.Errorf("failed to read docx: %w", err)
	}
	defer replaceDocx.Close()

	doc := replaceDocx.Editable()
	raw := doc.GetContent()

	return raw, nil
}