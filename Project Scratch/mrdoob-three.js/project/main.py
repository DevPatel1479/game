class Node:
    def __init__(self) -> None:
        print("This is a constructor... ")
    def __del__(self):
        print("This is a destructor... ")
   
obj = Node()
