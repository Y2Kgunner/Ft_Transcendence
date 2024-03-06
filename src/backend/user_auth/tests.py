from django.test import TestCase
from django.test import TestCase
from .models import WebUserManager, WebUser
from django.contrib.auth import get_user_model

class WebUserManagerTest(TestCase):
    def setUp(self):
        self.user_manager = WebUserManager()

    def test_create_user_valid(self):
        user = self.user_manager.create_user('testuser', 'test@example.com', 'password123')
        self.assertIsInstance(user, get_user_model())
        self.assertEqual(user.username, 'testuser')
        self.assertEqual(user.email, 'test@example.com')

    def test_create_user_no_email(self):
        with self.assertRaises(ValueError):
            self.user_manager.create_user('testuser', '', 'password123')

    def test_create_user_no_username(self):
        with self.assertRaises(ValueError):
            self.user_manager.create_user('', 'test@example.com', 'password123')


    def test_create_superuser(self):
        superuser = self.user_manager.create_superuser('admin', 'admin@example.com', 'admin123')
        self.assertTrue(superuser.is_superuser)
        self.assertTrue(superuser.is_staff)

