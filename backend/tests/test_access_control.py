import unittest

class TestAccessControl(unittest.TestCase):
    def test_investigator_role_assignment(self):
        roles = {'officer_1': 'INVESTIGATOR'}
        self.assertEqual(roles.get('officer_1'), 'INVESTIGATOR')
