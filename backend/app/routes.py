def includeme(config):
    config.add_route("status", "/api/status")

    config.add_route("auth.register", "/api/auth/register")
    config.add_route("auth.login", "/api/auth/login")

    config.add_route("books.list", "/api/books")
    config.add_route("books.detail", "/api/books/{id}")

    config.add_route("borrow.create", "/api/borrow/{book_id}")
    config.add_route("return.create", "/api/return/{borrowing_id}")

    config.add_route("borrowings.list", "/api/borrowings")
    config.add_route("history.list", "/api/history")
    
    config.add_route("cloudinary.upload", "/api/cloudinary/upload")