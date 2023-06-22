import pandas as pd
import os

# Define the directory with the input files and where to save the output files
input_dir = "no_24_T_3"
output_dir = "output_pivot_3"

# Create the output directory if it doesn't exist
os.makedirs(output_dir, exist_ok=True)

# Loop through each file in the input directory
for filename in os.listdir(input_dir):
    if filename.endswith(".csv"):
        # Load the file into a pandas DataFrame
        df = pd.read_csv(os.path.join(input_dir, filename))

        # Print the column names
        print(f"Columns in {filename}: {df.columns}")

        # Pivot the DataFrame
        df_pivot = df.pivot(index='TIME', columns='SERIES', values='VALUE')

        # Save the pivoted DataFrame to a new CSV file in the output directory
        df_pivot.to_csv(os.path.join(output_dir, filename), sep=',')

print("Data transformation completed.")
