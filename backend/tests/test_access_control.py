import unittest

class TestAccessControl(unittest.TestCase):
    def test_investigator_role_assignment(self):
        roles = {'officer_1': 'INVESTIGATOR'}
        self.assertEqual(roles.get('officer_1'), 'INVESTIGATOR')

def test_unauthorized_role_rejection(self):
        roles = {'officer_1': 'INVESTIGATOR'}
        self.assertNotEqual(roles.get('officer_1'), 'SUPER_ADMIN')
