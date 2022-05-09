const kebab = (text: string) => {
  return text.toLowerCase().replaceAll(" ", "-");
}

export default kebab;