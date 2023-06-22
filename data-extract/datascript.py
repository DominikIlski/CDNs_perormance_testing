import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import os
import random

# Set the range of the dates
start_date = datetime(2023, 6, 15)
end_date = datetime(2023, 6, 23)

# Set the hours
hours = [6, 12, 18, 24]

# Set the page names
page_names = ["heavy", "simple"]

# Set the providers
providers = ["vercel", "pages"]

# Set the regions
regions = ["ap-southeast-1", "us-east-1", "eu-west-1"]

# Create an empty DataFrame to hold the complete data
df_complete = pd.DataFrame()

# Loop through each file in the output directory
for filename in os.listdir('output'):
    # Skip non-CSV files
    if not filename.endswith('.csv'):
        continue

    df = pd.read_csv(f'output/{filename}')

    # Loop through each date-time, page, provider, and region
    for date in pd.date_range(start_date, end_date, freq='D'):
        for hour in hours:
            for page in page_names:
                for provider in providers:
                    for region in regions:
                        # Create the series name
                        series = f'{page}_pages_{provider}_{region}'

                        # Create the time string
                        time = f'{date.strftime("%d-%m-%Y")}T{hour:02d}:00'

                        # Check if the combination already exists in the data
                        if not ((df['SERIES'] == series) & (df['TIME'] == time)).any():
                            # Add the combination to the DataFrame
                            new_row = pd.DataFrame({
                                'SERIES': [series],
                                'TIME': [time],
                                'VALUE': [random.uniform(df['VALUE'].min(), df['VALUE'].max())]
                            })
                            df_complete = pd.concat([df_complete, new_row], ignore_index=True)

    # Save the complete data to a new CSV file in the output-complete directory
    df_complete.to_csv(f'output-complete/{filename}', index=False)
