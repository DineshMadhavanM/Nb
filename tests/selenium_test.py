import unittest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time

class Nineteen06Test(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Initialize Chrome driver (make sure chromedriver is in PATH or use webdriver-manager)
        cls.driver = webdriver.Chrome()
        cls.driver.maximize_window()
        cls.base_url = "http://localhost:3001"

    @classmethod
    def tearDownClass(cls):
        cls.driver.quit()

    def test_credit_payment_flow(self):
        driver = self.driver
        driver.get(self.base_url)

        # 1. Access Gate
        wait = WebDriverWait(driver, 10)
        password_input = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='password']")))
        password_input.send_keys("V1906gan")
        password_input.send_keys(Keys.ENTER)

        # Wait for Dashboard to load
        wait.until(EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'Dashboard')]")))
        print("Logged in successfully.")

        # 2. Go to POS
        pos_link = driver.find_element(By.XPATH, "//a[contains(text(), 'POS')]")
        pos_link.click()
        
        # 3. Add Item to Cart
        # Wait for products to load and click the first one
        add_btn = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Add')]")))
        add_btn.click()
        print("Item added to cart.")

        # 4. Proceed to Checkout
        checkout_btn = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Proceed to Checkout')]")))
        checkout_btn.click()

        # 5. Select Credit Payment
        credit_btn = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(., 'Credit')]")))
        credit_btn.click()

        # 6. Select Due Date (Tomorrow)
        tomorrow_btn = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Tomorrow')]")))
        tomorrow_btn.click()

        # 7. Complete Order
        record_btn = driver.find_element(By.XPATH, "//button[contains(text(), 'Record Credit Order')]")
        record_btn.click()
        print("Order placed successfully.")

        # 8. Verify in Dashboard
        # Wait for navigation or go back manually
        time.sleep(2) # Wait for processing
        driver.get(f"{self.base_url}/")
        
        # Verify "Pending" status in recent orders
        pending_badge = wait.until(EC.presence_of_element_located((By.XPATH, "//button[contains(text(), 'Pending')]")))
        self.assertIsNotNone(pending_badge, "Order should be listed as Pending")
        print("Verified: Order appears in Dashboard with Pending status.")

if __name__ == "__main__":
    unittest.main()
