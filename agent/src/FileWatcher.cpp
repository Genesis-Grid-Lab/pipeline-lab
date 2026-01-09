#include "fs/FileWatcher.h"

#if defined(__linux__)
    #include "fs/FileWatcherLinux.h"
#elif defined(_WIN32)
    #include "fs/FileWatcherWindows.h"
#elif defined(__APPLE__)
    #include "fs/FileWatcherMac.h"
#endif

Scope<FileWatcher> FileWatcher::Create() {
#if defined(__linux__)
    return CreateScope<FileWatcherLinux>();
#elif defined(_WIN32)
    return CreateScope<FileWatcherWindows>();
#elif defined(__APPLE__)
    return CreateScope<FileWatcherMac>();
#else
    return nullptr;
#endif
}
