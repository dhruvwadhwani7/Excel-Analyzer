const ADMIN_CREDENTIALS = [
  {
    email: 'admin@gmail.com',
    password: 'admin123',
    role: 'admin'
  },
  {
    email: 'zidio@gmail.com',
    password: 'zidio123',
    role: 'admin'
  }
];

exports.isAdmin = (email, password) => {
  return ADMIN_CREDENTIALS.find(
    admin => admin.email === email && admin.password === password
  );
};
