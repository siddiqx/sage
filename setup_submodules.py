"""
Sage Submodule Setup & Portal Synchronizer
Copies pre-built interactive learning portals into cloned practice submodules.
"""
import os
import shutil

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))

PORTAL_MAPPINGS = {
    '01-Python/Practice/Exercism-Python-Track/index.html': 'portal-templates/01-Python-Exercism.html',
    '02-SQL-and-Databases/Practice/Pagila-Sample-Database/index.html': 'portal-templates/02-SQL-Pagila.html',
    '03-Data-Engineering/Practice/Data-Engineering-Zoomcamp/index.html': 'portal-templates/03-DataEngineering-Zoomcamp.html',
    '03-Data-Engineering/Practice/dbt-Jaffle-Shop/index.html': 'portal-templates/03-DataEngineering-JaffleShop.html',
    '08-Blockchain-and-Solidity/Practice/OpenZeppelin-Contracts/index.html': 'portal-templates/08-Blockchain-OpenZeppelin.html',
    '10-Software-and-Web-Development/Practice/Type-Challenges-Repository/index.html': 'portal-templates/10-WebDev-TypeChallenges.html',
}

def main():
    print("Synchronizing Sage practice lab interactive portals...")
    synced = 0
    for target_rel, template_rel in PORTAL_MAPPINGS.items():
        target_path = os.path.join(ROOT_DIR, target_rel.replace('/', os.sep))
        template_path = os.path.join(ROOT_DIR, template_rel.replace('/', os.sep))
        
        target_dir = os.path.dirname(target_path)
        if os.path.isdir(target_dir):
            if os.path.exists(template_path):
                shutil.copy2(template_path, target_path)
                print(f"  [OK] Installed portal: {target_rel}")
                synced += 1
            else:
                print(f"  [MISSING TEMPLATE] {template_rel}")
        else:
            print(f"  [SKIPPED] Submodule directory not cloned yet: {target_dir}")
            print(f"            Run 'git submodule update --init --recursive' first.")
            
    print(f"\nSetup complete: {synced}/{len(PORTAL_MAPPINGS)} portals active.")

if __name__ == '__main__':
    main()
