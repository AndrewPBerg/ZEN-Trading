import pandas
def main():
    # Create a simple DataFrame
    data = {
        'A': [1, 2, 3, 4, 5],
        'B': [10, 20, 30, 40, 50]
    }
    df = pandas.DataFrame(data)
    print("DataFrame head:")
    print(df.head())


if __name__ == "__main__":
    main()
