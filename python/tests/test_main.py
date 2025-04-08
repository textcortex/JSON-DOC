"""
Main test runner that ensures all tests are run when using pytest.
Individual test files are imported here to ensure pytest discovers them all.
"""

# Import all test modules to ensure they're discovered by pytest
from tests.test_serialization import test_load_page  # noqa
from tests.test_html_to_jsondoc import test_examples, test_convert_html_all_elements  # noqa
# test_validation.py is handled by the custom collector in conftest.py


def test_import_check():
    """Simple check to ensure all test modules are imported correctly"""
    assert True, "All test modules imported successfully"
