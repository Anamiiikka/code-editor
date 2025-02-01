import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);  // Create a Scanner object
        System.out.print("Enter a number: ");
        int n = scanner.nextInt();  // Read user input

        for (int i = 1; i <= n; i++) {
            System.out.print(i + " ");  // Print numbers from 1 to n
        }

        System.out.println(); // Move to the next line after printing numbers
        scanner.close(); // Close the scanner
    }
}
