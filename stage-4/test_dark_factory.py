# Stage 4 - Integration test for Dark Factory runner
# Contributors: Google AI Studio, BAND

import unittest
from dark_factory import DarkFactoryRunner

class TestStage4DarkFactory(unittest.TestCase):
    def test_dark_factory_suite(self):
        runner = DarkFactoryRunner()
        results = runner.run_all_vectors()
        self.assertEqual(results["failed"], 0)
        self.assertEqual(results["passed"], 5)

if __name__ == "__main__":
    unittest.main()
