cmake_minimum_required(VERSION 3.10)
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

# build output directories

set(CMAKE_LIBRARY_OUTPUT_DIRECTORY $<0:>${CMAKE_BINARY_DIR}/bin)
set(CMAKE_RUNTIME_OUTPUT_DIRECTORY $<0:>${CMAKE_BINARY_DIR}/bin)
set(CMAKE_ARCHIVE_OUTPUT_DIRECTORY $<0:>${CMAKE_BINARY_DIR}/lib)
set(CMAKE_PDB_OUTPUT_DIRECTORY $<0:>${CMAKE_BINARY_DIR}/lib)
set(EXECUTABLE_OUTPUT_PATH $<0:>${CMAKE_BINARY_DIR}/bin)

project(Pipeline-agent LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_EXTENSIONS ON)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

find_package(Threads REQUIRED)
add_subdirectory(${CMAKE_CURRENT_SOURCE_DIR}/vendor/JSON)
add_subdirectory(${CMAKE_CURRENT_SOURCE_DIR}/vendor/spdlog)

if(UNIX)
  file(GLOB linuxFile ${CMAKE_CURRENT_SOURCE_DIR}/src/Linux/*.cpp)
endif()

file(GLOB coreFile ${CMAKE_CURRENT_SOURCE_DIR}/src/*.cpp)

add_executable(${PROJECT_NAME}
  ${coreFile}
  ${linuxFile}
)

#target_precompile_headers(${PROJECT_NAME} PUBLIC ${CMAKE_CURRENT_SOURCE_DIR}/include/repch.h)

target_include_directories(${PROJECT_NAME} PUBLIC
  ${CMAKE_CURRENT_SOURCE_DIR}/include
  ${CMAKE_CURRENT_SOURCE_DIR}/vendor/JSON/include
  ${CMAKE_SOURCE_DIR}/vendor/spdlog/include
  ${CMAKE_SOURCE_DIR}/vendor/cpp-httplib
)


target_link_libraries(${PROJECT_NAME} PUBLIC
  Threads::Threads
  nlohmann_json
  spdlog
)


# copy resources
# if(EXISTS ${CMAKE_SOURCE_DIR}/Resources)
#     add_custom_command(TARGET ${PROJECT_NAME} POST_BUILD COMMAND 
#         ${CMAKE_COMMAND} -E copy_directory 
#         ${CMAKE_SOURCE_DIR}/Resources
#         ${EXECUTABLE_OUTPUT_PATH}/Resources
#     )
# else()
#     message(WARNING "[WARNING] no resources directory!")
# endif()
