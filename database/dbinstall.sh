for file in *.sql; do
  echo "Importing $file..."
  mysql -u root vietcoin < "$file"
done