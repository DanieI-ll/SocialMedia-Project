export const validateRegister = (data: { email?: string; username?: string; password?: string }) => {
  const errors: string[] = [];
  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.push("Некорректный email");
  if (!data.username || data.username.length < 3) errors.push("Имя пользователя должно быть не короче 3 символов");
  if (!data.password || data.password.length < 6) errors.push("Пароль должен быть не короче 6 символов");
  return errors;
};
